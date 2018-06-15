"use strict";

/**
 * Represents our LocalWeather module
 * This is our module that contains all logic for the widget, for the purposes of this test
 * an entire instance of the logic is exported for public access
 */
var LocalWeather = (function() {
   
   var Instance = {
       
       _defaults: {
           path: 'https://weathersync.herokuapp.com/'
       },

       _convertTemp: function(temp) {
         
         return Math.round((temp - 273.15) * 9/5 + 32);
           
       },
       
       /**
        * @constructor _fadeElement() 
        * @params {object}: {} options to configure fadeInOut animation 
        * options - element {DOMNode}: element to be animated
        * options - opacity {integer}: starting opacity of element
        * options - display {string}: elements display style prior to animation, default = "block"
        * options - type {string}: type of animation, "fadeIn" or "fadeOut"
        */
        
       _fadeElement: function(options) {
            var element = options.element,
                opacity = options.opacity,
                display = options.display,
                type = options.type;
                
            element.style.opacity = opacity;
            element.style.display = display || "block";
                
            if(type === "fadeIn") {
                (function fade() {
                    var val = parseFloat(element.style.opacity);
                    if (!((val += .1) > 1)) {
                        element.style.opacity = val;
                        requestAnimationFrame(fade);
                    }
                })();        
            } else if(type === "fadeOut") {
                (function fade() {
                    var val = parseFloat(element.style.opacity);
                    if (!((val -= .1) < 0)) {
                        element.style.opacity = val;
                        requestAnimationFrame(fade);
                    }
                })();
            }
            
       },
       
       /**
        * @constructor _stretchElement()
        * @params {object} - {} options to configure stretch animation
        * options - element {DOMNode}: element to be animated
        * options - targetHeight {integer}: target height of element to be animated to
        */
       _stretchElement: function(options) {
           var  element = options.element,
                targetHeight = options.targetHeight,
                done = false;
            
            (function stretch(){
                
                var val = parseFloat(element.style.height.split("px")[0]);
                
                if(((val += 20) < targetHeight)) {
                    element.style.height = val + "px";
                    requestAnimationFrame(stretch);  
                } 
            })();
       },
       
        /**
         * @constructor Get()
         * params {string}: path representing url to call
         */
        Get: function(path) {
            return new Promise(function(resolve,reject){
               var xhr = new XMLHttpRequest();
               
               xhr.open('GET', path);
               
               xhr.onload = () => {
                   if(xhr.status === 200) resolve(xhr.response);
                   else reject("Unable to load JSON");
               } 
               
               xhr.onerror = () => {
                   reject("Error occurred loading JSON");
               }
               
               xhr.send();
            });
        },
        
        /**
         * @contructor Init()
         * params - none
         */
        
        Init: function() {
            var ipPath = this._defaults.path + 'ip',
                weatherPath = this._defaults.path + 'weather/',
                widgetContainer = document.getElementById('localWeather'),
                parentContainer = document.getElementById('mainContainer'),
                _self = this;
                
            
            this.Get(ipPath).then(json => {
                var locationData = JSON.parse(json),
                    lat = locationData.location.latitude,
                    long = locationData.location.longitude,
                    currentConditionsLabel = "Current conditions for:",
                    preloader = document.querySelector('.preloader'),
                    params = lat + "," + long;                
                
                //start weatherPath Get()
                this.Get(weatherPath + params).then(json => {
                    var weatherData = JSON.parse(json),
                        weather = weatherData.weather[0],
                        currentTemp = this._convertTemp(weatherData.main.temp),
                        weatherContainer = document.createElement('div'),
                        weatherTpl = `
                        <p>${currentConditionsLabel}</p>
                        <h3>${locationData.city}</h3>
                        <h2>${currentTemp}&#8457;</h2>
                        <img src="http://openweathermap.org/img/w/${weather.icon}.png" alt="${weather.main}" />
                        <h3>${weather.main}</h3>`;
                        
                        var fadeOutOptions = {
                            element: preloader,
                            opacity: 1,
                            type: "fadeOut"
                        };
                        
                        var fadeInOptions = {
                            element: widgetContainer,
                            opacity: 0,
                            type: "fadeIn"
                        };
                        
                        var stretchOptions = {
                            element: parentContainer,
                            targetHeight: 350,
                        };
                        
                        //animation sequences, for cleaner UX
                        
                        //fadeout preloader
                        this._fadeElement(fadeOutOptions);
                        
                        //prepare HTML to append
                        weatherContainer.innerHTML = weatherTpl;
                        
                        //animate dimensions
                        
                        this._stretchElement(stretchOptions)
                        
                        //minor delay, quick dirty solution just for demo
                        //NOTE: better to handle animation sequences with a promises design
                        setTimeout(function() {
                            //append HTML
                            widgetContainer.appendChild(weatherContainer);  
                            //fadeIn weather data
                            _self._fadeElement(fadeInOptions)  
                        }, 500);
                                            
                    
                }).catch(error => {
                    console.log(error);
                }); //end weatherPath Get()
                 
            }).catch(error => {
                console.log(error);
            }); //end iPath Get ()
        }
           
   };
    
   return Instance; 
}());

window.onload = LocalWeather.Init();