type id = 34 | 13 | 20 | 21 | 32
type value = Pick<fetchData, 'valor'>['valor']

type date = string

export interface BuoyFetch {
  fecha: date
  datos: buoyFetchDatos[]
}

export interface buoyFetchDatos {
  id: id
  nombreParametro: string
  nombreColumna: string
  paramEseoo: string
  valor: string
  factor: number
  unidad: string
  paramQC: boolean
  variable: string
  averia: boolean
}

type formatedBuoys = {
  fecha: string
  datos: {
    'Periodo de Pico': number
    'Altura Signif del Oleaje': number
    'Direcc Media de Proced': number
    'Direcc de pico de proced': number
    'Periodo Medio Tm02': number
  }
}

export interface DbBuoyRecord {
  fecha: string
  datos: {
    'Periodo de Pico': number
    'Altura Signif. del Oleaje': number
    'Direcc. Media de Proced.': number
    'Direcc. de pico de proced.': number
    'Periodo Medio Tm02': number
  }
}

export interface WaveData {
  year: number
  month: number
  day: number
  hour: number
  height: number
  period: number
  waveDirection: number
  wind: {
    speed: number
    direction: {
      angle: number
      letters: string
    }
  }
  energy: string
}
