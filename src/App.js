import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import logo from './logo.svg';
import './App.css';
import AltWindow from './AltWindow'
const stations = require('./stations.geojson');

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            stationId: null,
            stationName: null,
            tramInbound: null,
            tramOutbound: null
        };
    }

    componentDidMount() {
        this.makeMap();
    };


    makeMap() {
        mapboxgl.accessToken = 'pk.eyJ1IjoicmJ3dHAiLCJhIjoiY2ppYnpramswMGkxODN4bDdscW83ZnR1aiJ9._1mJRHEve76MQVXN' +
            'xfUzjQ'

        const map = new mapboxgl.Map({
            container: this.container, style: 'mapbox://styles/rbwtp/cjiw1va1l70xv2rnvxxhr8eza',
            // ice craeam - 'mapbox://styles/rbwtp/cjiw1loev703z2rno0tej40ou', 
            // dark- 'mapbox://styles/rbwtp/cjiup82w804pw2so3pn4l19t0',
            // 'mapbox://styles/rbwtp/cjiw1va1l70xv2rnvxxhr8eza'
            center: [
                -6.260055, 53.350000
            ],
            zoom: 11.5,
            pitch: 35,
            bearing: -6.6,
            attributionControl: false
        })
        map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');

        map.on('load', () => {
            map.addSource('luasMap', {
                type: 'geojson',
                data: stations //'https://gist.githubusercontent.com/limjinsun/ef1607553040213174d12caa1e37fe91/raw/a30c586655053507b833848d30652fe74c774364/luas.geojson'
            });
        })

        map.on('load', () => {
            map.addLayer({
                "id": "layer-01",
                "type": "circle",
                "source": "luasMap",
                "paint": {
                    "circle-radius": 5,
                    "circle-color": "#007cbf"
                }
            });

            // Center the map on the coordinates of any clicked symbol from the 'symbols'
            // layer.
            map.on('click', 'layer-01', (e) => {
                map.flyTo({ center: e.features[0].geometry.coordinates, zoom: 14.8, speed: 1, curve: 1.8 });
                var features = map.queryRenderedFeatures(e.point, { layers: ['layer-01'] });
                // if the features have no info, return nothing
                if (!features.length) {
                    return;
                }
                var feature = features[0];

                // Populate the popup and set its coordinates based on the feature found
                function populatePopup() {
                    return new mapboxgl
                        .Popup()
                        .setLngLat(feature.geometry.coordinates)
                        .setHTML('<div id=\'popup\' class=\'popup\' style=\'z-index: 10;\'><ul class=\'list-group' +
                            '\'><li class=\'list-group-item\'>' + feature.properties['Name'] + ' </li>' + 
                            '<li class=\'list-group-item\'><a href="https://maps.google.com/maps?daddr=' + feature.geometry.coordinates[1] + ',' + feature.geometry.coordinates[0] + '" target="_blank"> ' + 'Open here in Google Map' + '</a>' +
                            '</li></ul></div>')
                        .addTo(map)
                }
                var popup = populatePopup();

                var tramInbound = []
                var tramOutbound = []

                var id = e.features[0].properties.Id
                var Name = e.features[0].properties.Name
                var getRealTimeData = () => {
                    var myHeaders = new Headers();
                    myHeaders.append('pragma', 'no-cache');
                    myHeaders.append('cache-control', 'no-cache');
                    var myInit = {
                        method: 'GET',
                        headers: myHeaders
                    };
                    return fetch('https://wiki.liffeyireland.com:8443/Luas/' + id, myInit) //'http://localhost:8080/luas/' + id
                        .then(function (response) {
                            if (response.status !== 200) {
                                console.log('Looks like there was a problem. Status Code: ' + response.status);
                                return;
                            }
                            response
                                .json()
                                .then((data) => {
                                    data.forEach((element) => {
                                        if(element.Direction === "Inbound"){
                                            tramInbound = tramInbound + '<li class=\'list-group-item\'>' + element.Destination + ' - DueTime : ' + element.DueTime + '</li>'   
                                        } else if (element.Direction === "Outbound") {
                                            tramOutbound = tramOutbound + '<li class=\'list-group-item\'>' + element.Destination + ' - DueTime : ' + element.DueTime + '</li>'   
                                        }
                                    })
                                    /**
                                     *  It didn't work. why??
                                     *  for (element in data) {
                                            tramInbound = tramInbound + '<li class=\'list-group-item\'>' + element.Destination + ' - DueTime : ' + element.DueTime + '<li>'
                                        }
                                     */
                                });
                        })
                        .catch(function (err) {
                            console.log('Fetch Error :-S', err);
                        });
                }
                var asyncCall = async () => {
                    await getRealTimeData().then(() => {
                        this.setState({ stationId: id, tramInbound: tramInbound, tramOutbound: tramOutbound, stationName: Name });
                    });
                    // set-state for additional component.
                }
                asyncCall();
            });

            // Change the cursor to a pointer when the it enters a feature in the 'symbols'
            // layer.
            map.on('mouseenter', 'layer-01', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            // Change it back to a normal cursor when it leaves.
            map.on('mouseleave', 'layer-01', () => {
                map.getCanvas().style.cursor = '';
            });
        });
    }

    render() {
        return (
            <div>
                <AltWindow stationId={this.state.stationId} tramInbound={this.state.tramInbound} tramOutbound={this.state.tramOutbound} stationName={this.state.stationName}/>
                <div className='Map' ref={(x) => { this.container = x }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh'
                    }}></div>
            </div>
        )
    }
}

export default App;