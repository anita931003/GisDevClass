const defaultControls = ol.control.defaults;  //取用defaults控制器群套件
const ZoomSlider = ol.control.ZoomSlider;  //取用ZoomSlider放大縮小軸控制器套件
const CircleStyle = ol.style.Circle;  //取用style套件Circle類別
const Fill = ol.style.Fill;  //取用style套件Fill類別
const Stroke = ol.style.Stroke;  //取用style套件Stroke類別
const Style = ol.style.Style;  //取用style套件Style類別
const LineString = ol.geom.LineString;  //取用LineString套件
const Polygon = ol.geom.Polygon;  //取用Polygon套件
const Overlay = ol.Overlay;  //取用Overlay套件
const Kml = ol.format.KML;  //取用KML套件

//建立OSM地圖為raster圖層的來源
const rasterSource = new ol.source.OSM();

//建立raster圖層
const raster = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

//建立Vector地圖為vector圖層的來源
const vectorSource = new ol.source.Vector({
  url: 'fcu.kml',
  format: new Kml({
    extractStyles: false, // 🟥 原本是 true，改為 false 才能用自己設定的顏色
  }),
});

//建立vectorStyle為vector圖層的樣式設定
const vectorStyle = new Style({
  fill: new Fill({  //多邊形的填色
    color: 'rgba(254, 200, 138, 0.46)',    //rgba(red,green,blue,alpha)
  }),
  stroke: new Stroke({  //代表線段的樣式
    color: '#ff7b00ff',
    width: 4,
  }),
})

// 🟥 新增：定義高亮樣式（滑鼠移入或點擊）
const highlightStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 200, 0, 0.8)',   // 濃黃色透明
  }),
  stroke: new Stroke({
    color: '#FF4500',                  // 深橘紅色邊框
    width: 4,
  }),
});

//建立Vector圖層
const vector = new ol.layer.Vector({
  source: vectorSource,
  style: vectorStyle,
});

//建立 放大縮小軸 控制器
const zoomSliderControl = new ZoomSlider();

//建立地圖View(視角)
const view = new ol.View({
  center: ol.proj.fromLonLat([120.64988972747376, 24.18075322200877]),
  zoom: 16
});

//建立地圖
var map = new ol.Map({
  controls: defaultControls().extend([zoomSliderControl]),
  target: 'map',
  layers: [raster, vector],
  view: view,
});

//工具提示物件.
let measureTooltipElement;

//這個是一個區域疊加層(Overlay), 用來放置顯示名稱(measureTooltipElement)
let measureTooltip;

//建立一個新的工具提示 Create a new measure tooltip
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],  //位移的數值
    positioning: 'bottom-center',
    stopEvent: false,
    insertFirst: false,
  });
  map.addOverlay(measureTooltip);
}

//顯示圖徵名稱函數
function displayFeatureInfo(pixel) {
  const features = [];
  //forEachFeatureAtPixel 判斷被點到的圖徵有哪些
  map.forEachFeatureAtPixel(pixel, function (feature) {
    features.push(feature);  //把元素放入陣列
  });
  if (features.length > 0) {
    const info = features[0].get('name');  //取出名稱文字內容
    document.getElementById('info').innerHTML = info;

        createMeasureTooltip();  //建立新的工具提示
    measureTooltipElement.innerHTML = info;
    const tooltipCoord = features[0].getGeometry().getInteriorPoint().getCoordinates(); //取得內心坐標
    measureTooltip.setPosition(tooltipCoord);
    
    map.getView().fit(features[0].getGeometry().getExtent());
    view.setZoom(view.getZoom() - 2);
  } else {
    document.getElementById('info').innerHTML = '&nbsp;';
  }
};

//當滑鼠按下圖徵時
map.on('click', function (evt) {
   displayFeatureInfo(evt.pixel);
});

// 🟥 新增：滑鼠移動事件（暫時高亮）
map.on('pointermove', function (evt) {
  if (evt.dragging) return;
  const pixel = map.getEventPixel(evt.originalEvent);
  const feature = map.forEachFeatureAtPixel(pixel, f => f);

  if (feature) {
    // 滑過不同建築物
    if (hoveredFeature && hoveredFeature !== feature && hoveredFeature !== selectedFeature) {
      hoveredFeature.setStyle(vectorStyle);
    }
    // 若不是已選取的那個，暫時高亮
    if (feature !== selectedFeature) {
      feature.setStyle(highlightStyle);
    }
    hoveredFeature = feature;
  } else {
    // 滑出時恢復原樣
    if (hoveredFeature && hoveredFeature !== selectedFeature) {
      hoveredFeature.setStyle(vectorStyle);
    }
    hoveredFeature = null;
  }
});