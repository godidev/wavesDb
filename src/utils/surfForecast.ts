import * as cheerio from 'cheerio'
import { SurfForecastModel } from '../models/surf-forecast'
import { WaveData } from '../types'

async function fetchSurfForecast(beach = 'Sopelana'): Promise<string> {
  const url = `https://es.surf-forecast.com/breaks/${beach}/forecasts/data?parts=basic&period_types=h&forecast_duration=48h`

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'accept-language': 'en-US,en;q=0.9,es;q=0.8',
      cookie: 'last_loc=3580; ',
      '^if-none-match': 'W/^^26736cd3943005b5e3c01a6cf13a8798^^^',
      priority: 'u=1, i',
      referer: `https://es.surf-forecast.com/breaks/${beach}/forecasts/latest`,
      '^sec-ch-ua': '^^Google',
      'sec-ch-ua-mobile': '?0',
      '^sec-ch-ua-platform': '^^Windows^^^',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'x-csrf-token':
        'fX2oQTDp4Y0cUt8YM8H3V/eKNP1X/Iy2MTOyPLACKmiTLblSBmy78AVmz3xoOB8tbPTyybzKlr1nn6sYZs5teg==',
    },
  }
  try {
    const response = await fetch(url, options)
    const data = await response.json()
    return data.period_types.h.parts.basic.content
  } catch (err) {
    throw new Error('Error fetching surf forecast')
  }
}

async function parseForecast(html: string) {
  const $ = cheerio.load(html)
  const waves = $('td.forecast-table__cell.forecast-table-wave-graph__cell')
  const energy = $(
    'td.forecast-table__cell.forecast-table-energy__cell > strong',
  )
  const data = [] as WaveData[]
  const date = new Date()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  waves.each((index, element) => {
    const [day, hour] = getDate($(element).attr('data-date') as string)
    const dataArray = JSON.parse($(element).attr('data-swell-state') as string)

    if (!dataArray) {
      console.log('dataArray is empty')
      return
    }

    const energyElement = energy.get(index)
    const {
      period,
      angle: waveDirection,
      height,
    } = dataArray.find((item: WaveData) => item !== null) || {}
    const { speed, direction } = JSON.parse(
      $(element).attr('data-wind') as string,
    )

    const { angle, letters } = direction

    data.push({
      year,
      month,
      day,
      hour,
      height,
      period,
      waveDirection,
      wind: {
        speed,
        direction: { angle, letters },
      },
      energy: energyElement ? $(energyElement).text() : '',
    })
  })
  return data
}

function getDate(date: string): number[] {
  const [, day, hour] = date.split(' ')
  const parsedDay = parseInt(day)
  const [, time, period] = /^(\d+)(AM|PM)$/.exec(hour)!
  const parsedTime = parseInt(time)

  if (period === 'PM') {
    return parsedTime === 12
      ? [parsedDay, parsedTime]
      : [parsedDay, parsedTime + 12]
  }

  return [parsedDay, parsedTime]
}

export async function scheduledUpdate() {
  try {
    const html = await fetchSurfForecast()
    const newHtml = `<html><body><table>${html}</table></body></html>`
    const parsedData = await parseForecast(newHtml)
    await SurfForecastModel.addMultipleForecast(parsedData)
    console.log('updated surf forecast')
  } catch (err) {
    console.log('Error updating surf forecast')
  }
}
