require('jquery') ; 
require('leaflet') ; 



L.Icon.ToxicReleaseIcon = L.Icon.extend({
    options: {
      iconUrl: 'http://www.clker.com/cliparts/r/M/L/o/R/i/green-dot.svg',
      iconSize:     [30, 20], 
      iconAnchor:   [20 , 0], 
      popupAnchor:  [-5, -5] 
    }
});

L.icon.toxicReleaseIcon = function () {
    return new L.Icon.ToxicReleaseIcon();
};


L.LayerGroup.ToxicReleaseLayer = L.LayerGroup.extend(

    {
        options: {
            url: 'https://iaspub.epa.gov/enviro/efservice/tri_facility/pref_latitude/BEGINNING/41/rows/0:100/JSON',
            popupOnMouseover: false,
            clearOutsideBounds: false,       
            target: '_self',      
            minZoom: 0,
            maxZoom: 18
        },
      
        initialize: function (options) {
            options = options || {};
            L.Util.setOptions(this, options);  
            this._layers = {}; 

        },
        
        onAdd: function (map) {
            map.on('moveend', this.requestData, this);
            this._map = map;
            this.requestData();

        },
        
        onRemove: function (map) {
            map.off('moveend', this.requestData, this);
            this.clearLayers();
            this._layers = {};
        },
        
        requestData: function () {
                var self = this ; 
                (function() {
                    var script = document.createElement("SCRIPT");
                    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';
                    script.type = 'text/javascript';
                    var zoom = self._map.getZoom(), origin = self._map.getCenter() ;
                    script.onload = function() {
                        var $ = window.jQuery;
                        var TRI_url = "https://iaspub.epa.gov/enviro/efservice/tri_facility/pref_latitude/BEGINNING/41/rows/0:100/JSON" ;
                         $.getJSON(TRI_url , function(data){
                         self.parseData(data) ;    
                        });
                    };
                    document.getElementsByTagName("head")[0].appendChild(script);
                })(); 
            
            
        },
       
        getMarker: function (data) {
          
            var greenDotIcon =new L.icon.toxicReleaseIcon();
              var lat = data.PREF_LATITUDE ;
              var lng = data.PREF_LONGITUDE;
              var fac_name = data.FACILITY_NAME ;
              var city = data.CITY_NAME ; 
              var mail_street_addr = data.MAIL_STREET_ADDRESS ;
              var contact = data.ASGN_PUBLIC_PHONE ; 
              var tri_marker ; 
              if (!isNaN(parseInt(lat)) && !isNaN(parseInt(lng)) ){
                tri_marker = L.marker([lat , lng] , {icon: greenDotIcon}).bindPopup("<strong>Name : </strong>" + fac_name + "<br><strong> City :" + city +"</strong>" + "<br><strong> Street address : " + mail_street_addr + "</strong><br><strong> Contact : " + contact + "</strong>") ;
              }
            return tri_marker ; 
        },
        
        addMarker: function (data) {
            var marker = this.getMarker(data),
            
             key = data.TRI_FACILITY_ID ;   

            if (!this._layers[key]) {
                this._layers[key] = marker;
                this.addLayer(marker);   
            }
        },

        parseData: function (data) {
             
        if (!!data){
           for (i = 0 ; i < data.length ; i++) { 
            this.addMarker(data[i]) ; 
           }

             if (this.options.clearOutsideBounds) {
                this.clearOutsideBounds();
            }  
          }     
        },
        
        clearOutsideBounds: function () {
            var bounds = this._map.getBounds(),
                latLng,
                key;

            for (key in this._layers) {
                if (this._layers.hasOwnProperty(key)) {
                    latLng = this._layers[key].getLatLng();

                    if (!bounds.contains(latLng)) {         
                        this.removeLayer(this._layers[key]);
                        delete this._layers[key];
                    }
                }
            }
        }
    }
);

L.layerGroup.toxicReleaseLayer = function (options) {
    return new L.LayerGroup.ToxicReleaseLayer(options);
};