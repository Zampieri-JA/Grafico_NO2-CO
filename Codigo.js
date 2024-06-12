/* *****************************************************************************************
En este script se grafican las concentraciones del Monóxidode Carbono (CO) y del 
Dióxido de Nitrógeno (NO2) en la atmósfera (columna total), de tres ciudades 
troncales de Bolivia (2019 - 2023)
*****************************************************************************************
Para la elaboración de este script, se tomó como referencia el tutorial realizado por 
Amirhossein Ahrari para obtener las listas y funciones.
aquí el enlace del tutorial: https://www.youtube.com/watch?v=E6oguIdM8FQ&t=2138s
***************************************************************************************** */
// Autor: Jorge A. Zampieri

// Definicmos una zona de estudio, "Bolivia" para este caso
var bolivia = ee.FeatureCollection("USDOS/LSIB/2017")
.filter(ee.Filter.eq('COUNTRY_NA', 'Bolivia'))
Map.addLayer(bolivia.style({color:'#033A36', fillColor:'00000000'}), {}, 'Bolivia')

// Definimos la ubicación de las ciudades mediante coordenadas
var santa_cruz = ee.Feature(ee.Geometry.Point(-63.18172, -17.78339), {'label': 'Santa Cruz de la Sierra'});
var la_paz = ee.Feature(ee.Geometry.Point(-68.13138, -16.50349), {'label': 'La paz'});
var cochabamba = ee.Feature(ee.Geometry.Point(-66.18393, -17.38268), {'label': 'cochabamba'});

// Unimos las tres ubicaciones de las ciudades como un solo FeatureCollection
var ciudades = ee.FeatureCollection([santa_cruz, la_paz, cochabamba]);

// Creamos una paleta de colores para identificar cada ciudad
var COLOR = {
  Santa: '#12B019',
  Paz: '#B91313',
  Cocha: '#11A5D4'
};

// ******************************************************************************************************

// Definimos el rango de fecha
var time_start = '2019', time_end = '2024'

// Llamamos a la colección de sentinel 5 para el NO2
var NO2 = ee.ImageCollection("COPERNICUS/S5P/OFFL/L3_NO2")
.select(['NO2_column_number_density'],['NO2'])
.filterDate(time_start, time_end)
.filterBounds(ciudades)

// Se crean las listas de manera anual y mensual
var years_list = ee.List.sequence(ee.Number.parse(time_start), ee.Number.parse(time_end).subtract(1))
var months_list = ee.List.sequence(1, 12)

// Se crea la función para obtener las imagenes promedio de manera mensual
var no2_monthly = ee.ImageCollection(years_list.map(function(year){
  return months_list.map(function(month){
    var image = NO2.filter(ee.Filter.calendarRange(year, year, 'year'))
                  .filter(ee.Filter.calendarRange(month, month, 'month')).mean();
    var date = ee.Date.fromYMD(year, month, 1)
    return image
    .set('system:time_start', date.millis())
    })
  }).flatten())

// Se crea una paleta de colores para el NO2 y visualizamos en el mapa
var band_viz = {
  min: 0.0000372708446262736,
  max: 0.00005712141312557285,
  palette: ['black', 'blue', 'purple', 'cyan', 'green', 'yellow', 'red']
};
Map.addLayer(no2_monthly.mean().clip(bolivia), band_viz, 'NO2_mean', false)

// *****************************************************************************************************

// Se crea el gráfico para el NO2
var grafico_no2 = ui.Chart.image.seriesByRegion({
  imageCollection: no2_monthly,
  regions: ciudades,
  reducer: ee.Reducer.mean(),
  band: 'NO2',
  scale: 1113.2,
  xProperty: 'system:time_start',
  seriesProperty: 'label'
});
grafico_no2.setChartType('LineChart');
grafico_no2.setOptions({
  title: 'Concentración promedio mensual de Dióxido de Nitrógeno (NO2) en la atmósfera de tres ciudades de Bolivia',
  alignment: 'center',
  titleTextStyle: {
    color: '#0753BB',
    bold: true,
    fontSize: 18
  },
  vAxis: {
    title: 'Mol/m2',
    titleTextStyle: {
      bold: true,
      color: '#701403'
    }
  },
  hAxis: {
    title: 'Fechas (Enero de 2019 a Diciembre de 2023)',
    titleTextStyle: {
      bold: true,
      color: '#701403'
    }
  },
  lineWidth: 3,
  pointSize: 4,
  series: {
    0: {color: COLOR.Santa},
    1: {color: COLOR.Paz},
    2: {color: COLOR.Cocha}
  },
  chartArea: {
    width: '86%',
    height: '72%'
  },
  legend: {
    position: 'top',
    textStyle: {fontSize: 15}
  }
});
print(grafico_no2)

// **************************************************************************************************

// Llamamos a la colección de sentinel 5 para el CO
var co = ee.ImageCollection("COPERNICUS/S5P/OFFL/L3_CO")
.select(['CO_column_number_density'],['CO'])
.filterDate(time_start, time_end)
.filterBounds(bolivia)


// Se crea la función para obtener las imagenes promedio de manera mensual
var co_monthly = ee.ImageCollection(years_list.map(function(year){
  return months_list.map(function(month){
    var image1 = co.filter(ee.Filter.calendarRange(year, year, 'year'))
                  .filter(ee.Filter.calendarRange(month, month, 'month')).mean();
    var date = ee.Date.fromYMD(year, month, 1)
    return image1
    .set('system:time_start', date.millis())
    })
  }).flatten())

// Se crea una paleta de colores para el NO2 y visualizamos en el mapa
var band_viz1 = {
  min: 0.0,
  max: 0.05,
  palette: ['black', 'blue', 'purple', 'cyan', 'green', 'yellow', 'red']
};
Map.addLayer(co_monthly.mean().clip(bolivia), band_viz1, 'CO_mean', false)

// *****************************************************************************************************

// Se crea el gráfico para el CO
var grafico_co = ui.Chart.image.seriesByRegion({
  imageCollection: co_monthly,
  regions: ciudades,
  reducer: ee.Reducer.mean(),
  band: 'CO',
  scale: 1113.2,
  xProperty: 'system:time_start',
  seriesProperty: 'label'
});
grafico_co.setChartType('LineChart');
grafico_co.setOptions({
  title: 'Concentración promedio mensual de Monóxido de Carbono (CO) en la atmósfera de tres ciudades de Bolivia',
  alignment: 'center',
  titleTextStyle: {
    color: '#611102',
    bold: true,
    fontSize: 18
  },
  vAxis: {
    title: 'Mol/m2',
    titleTextStyle: {
      bold: true,
      color: '#03246A'
    }
  },
  hAxis: {
    title: 'Fechas (Enero de 2019 a Diciembre de 2023)',
    titleTextStyle: {
      bold: true,
      color: '#03246A'
    }
  },
  lineWidth: 3,
  pointSize: 4,
  series: {
    0: {color: COLOR.Santa},
    1: {color: COLOR.Paz},
    2: {color: COLOR.Cocha}
  },
  chartArea: {
    width: '86%',
    height: '72%'
  },
  legend: {
    position: 'top',
    textStyle: {fontSize: 15}
  }
});
print(grafico_co)

// Agregamos las ciudades al mapa
Map.addLayer(santa_cruz, {color: COLOR.Santa}, 'Santa Curz de la Sierra');
Map.addLayer(la_paz, {color: COLOR.Paz}, 'La Paz');
Map.addLayer(cochabamba, {color: COLOR.Cocha}, 'Cochabamba')
Map.centerObject(bolivia, 6)