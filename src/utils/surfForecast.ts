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

const convertDate = ({ day, hour }: { day: number; hour: number }) => {
  if (day < lastSeenDay) {
    if (month++ > 11) {
      month = 0
      year++
    }
  }
  lastSeenDay = day

  return new Date(year, month, day, hour, 0, 0, 0)
}

const now = new Date()
let month = now.getMonth()
let year = now.getFullYear()
let lastSeenDay: number = 0

async function parseForecast(html: string) {
  const $ = cheerio.load(html)

  const waves = $('td.forecast-table__cell.forecast-table-wave-graph__cell')
  const energy = $(
    'td.forecast-table__cell.forecast-table-energy__cell > strong',
  )

  const data: WaveData[] = []

  waves.each((index, element) => {
    const waveElement = $(element)
    const dataDate = waveElement.attr('data-date')
    const dataSwellState = JSON.parse(
      waveElement.attr('data-swell-state') as string,
    )
    const dataWind = JSON.parse(waveElement.attr('data-wind') as string)

    const [day, hour] = getDate(dataDate as string)
    const finalDate = convertDate({ day, hour })

    const energyElement = energy.get(index)
    const energyValue = energyElement ? $(energyElement).text() : ''

    const {
      period = 0,
      angle: waveDirection = 0,
      height = 0,
    } = dataSwellState.find((item: WaveData) => item !== null) || {}

    const {
      speed,
      direction: { angle: windAngle, letters: windLetters },
    } = dataWind

    data.push({
      date: finalDate,
      height,
      period,
      waveDirection: invertAngle(waveDirection),
      windSpeed: invertAngle(speed),
      windAngle: invertAngle(windAngle),
      windLetters,
      energy: energyValue,
    })
  })
  return data
}

const invertAngle = (angle: number) => (angle > 180 ? angle - 180 : angle + 180)

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
