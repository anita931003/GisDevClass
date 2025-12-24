const defaultControls = ol.control.defaults;  //取用defaults控制器群套件
const ZoomSlider = ol.control.ZoomSlider;  //取用ZoomSlider放大縮小軸控制器套件

//建立OSM地圖為raster圖層的來源
const rasterSource = new ol.source.OSM();

//建立raster圖層
const raster = new ol.layer.Tile({
  source: rasterSource,
});

//建立 放大縮小軸 控制器
const zoomSliderControl = new ZoomSlider();

//建立地圖View(視角)
const defaultViewOptions = {
  center: ol.proj.fromLonLat([120.6483, 24.1799]), //逢甲大學
  zoom: 16
};
const view = new ol.View(defaultViewOptions);

//建立地圖
var map = new ol.Map({
  controls: defaultControls().extend([zoomSliderControl]),
  target: 'map',
  layers: [raster],
  view: view,
});
