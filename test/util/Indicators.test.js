const { Indicators, Candle } = require('../../src/util')
  // 15 candles
const rawData = [
  [1533463200000.0, 7067.59, 7070, 7060.52, 7066.2, 31.954776],
  [1533463260000.0, 7066.2, 7077.74, 7066.2, 7077.74, 44.956988],
  [1533463320000.0, 7072.36, 7082.54, 7072.36, 7078.06, 49.029872],
  [1533463380000.0, 7078.07, 7078.43, 7075.41, 7078, 42.231384],
  [1533463440000.0, 7076.01, 7080.01, 7076.01, 7080.01, 93.10206],
  [1533463500000.0, 7078.94, 7089.87, 7078.94, 7083.73, 22.520387],
  [1533463560000.0, 7083.73, 7083.81, 7071, 7077.2, 31.903912],
  [1533463620000.0, 7078, 7079.94, 7068.43, 7068.43, 46.971676],
  [1533463680000.0, 7068.83, 7076.85, 7068.83, 7072.5, 22.008863],
  [1533463740000.0, 7072.51, 7073.86, 7066, 7066.12, 21.569248],
  [1533463800000.0, 7066.12, 7069.15, 7066, 7066.17, 7.718213],
  [1533463860000.0, 7068.99, 7072.18, 7066.17, 7067.69, 41.476141],
  [1533463920000.0, 7067.57, 7068.98, 7059.33, 7060.52, 64.07759],
  [1533463980000.0, 7063.11, 7063.11, 7050, 7050, 15.622217],
  [1533464040000.0, 7050, 7051.99, 7045.34, 7046.99, 12.636306],
  [1533464100000.0, 7045.37, 7060.66, 7045, 7057.21, 60.893857],
  [1533464160000.0, 7057.23, 7063.89, 7057.01, 7059.98, 11.811163],
  [1533464220000.0, 7059.97, 7066.86, 7058.7, 7061.52, 8.296382],
  [1533464280000.0, 7062, 7063.07, 7050.67, 7052, 18.830567],
  [1533464340000.0, 7054.94, 7061.08, 7053.97, 7060.34, 17.619053],
  [1533464400000.0, 7057.82, 7060.26, 7055.67, 7058.36, 19.536852],
  [1533464460000.0, 7058.35, 7060.01, 7054.89, 7059.45, 7.923262],
  [1533464520000.0, 7059.45, 7064.34, 7056.65, 7059.51, 8.798371],
  [1533464580000.0, 7059.51, 7061.97, 7059.51, 7061.86, 7.630032],
  [1533464640000.0, 7061.85, 7063.32, 7060.03, 7063.01, 13.960968],
  [1533464700000.0, 7063.05, 7065, 7060.04, 7063.02, 22.683954],
  [1533464760000.0, 7063.03, 7065.92, 7060.07, 7065.08, 16.057089],
  [1533464820000.0, 7065.08, 7073.34, 7063.03, 7069, 21.219293],
  [1533464880000.0, 7069, 7071.95, 7060.47, 7060.47, 17.681332],
  [1533464940000.0, 7060.36, 7063.24, 7060.03, 7061.77, 7.487279],
  [1533465000000.0, 7061.76, 7061.99, 7059.51, 7059.99, 7.178036],
  [1533465060000.0, 7060, 7060, 7052.9, 7052.9, 16.511286],
  [1533465120000.0, 7055.06, 7055.06, 7051.23, 7054.99, 4.99276],
  [1533465180000.0, 7054.98, 7057.11, 7051.5, 7052.86, 41.806436],
  [1533465240000.0, 7053.86, 7054.87, 7051.82, 7051.87, 31.569788],
  [1533465300000.0, 7051.82, 7052, 7041.99, 7044.73, 20.598412],
  [1533465360000.0, 7047.48, 7053.99, 7031, 7038, 25.50514],
  [1533465420000.0, 7038, 7038, 7031.02, 7037.54, 18.695566],
  [1533465480000.0, 7037.54, 7047.45, 7035.96, 7045.81, 22.388623],
  [1533465540000.0, 7042.3, 7044.62, 7040.99, 7041, 5.306541],
  [1533465600000.0, 7041, 7041, 7040.21, 7040.21, 7.698596],
  [1533465660000.0, 7040.65, 7040.66, 7034.06, 7035.08, 17.039157],
  [1533465720000.0, 7036.48, 7043.1, 7034.06, 7042.53, 18.056364],
  [1533465780000.0, 7042.76, 7052.04, 7042.52, 7043.49, 27.18928],
  [1533465840000.0, 7046.51, 7050.52, 7043.65, 7050.52, 14.447781],
  [1533465900000.0, 7046.82, 7052.58, 7046.82, 7049, 14.061391],
  [1533465960000.0, 7049, 7049.98, 7039.85, 7043.94, 17.551861],
  [1533466020000.0, 7046.74, 7046.75, 7040.01, 7042.88, 4.19653],
  [1533466080000.0, 7040.07, 7042.89, 7030.84, 7038.66, 16.619205],
  [1533466140000.0, 7037.43, 7039.99, 7036.21, 7038.67, 12.751689]
]

const SMA7 = 7044.1900
const SMA14 = 7042.3414
const EMA7 = 7042.5575
const EMA14 = 7044.7080
const MACD_26_12_9_value = -4.9499
const MACD_26_12_9_signal = -5.2554
const CCI14 = -67.0535

const round4 = (num) => {
  const multiplier = Math.pow(10, 4)
  return Math.round(num * multiplier) / multiplier
}

test('Gives correct SMA, EMA results', () => {
  const indicators = new Indicators()
  for (const raw of rawData) {
    indicators.update(new Candle(raw))
  }

  expect(round4(indicators.SMA[7])).toEqual(SMA7)
  expect(round4(indicators.SMA[14])).toEqual(SMA14)
  expect(round4(indicators.EMA[7])).toEqual(EMA7)
  expect(round4(indicators.EMA[14])).toEqual(EMA14)

  expect(round4(indicators.getMACD(26, 12, 9).value)).toEqual(MACD_26_12_9_value)
  expect(round4(indicators.getMACD(26, 12, 9).signal)).toEqual(MACD_26_12_9_signal)
  expect(round4(indicators.CCI[14])).toEqual(CCI14)
})
