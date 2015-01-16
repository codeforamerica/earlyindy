(function(exports) {
    var mapMarkers = []

    //counting markers
    var resultCount = 0

    exports.fetchFusionTablesData = function(fusionTablesID, callback) {
        $.ajax({
            dataType: 'jsonp',
            url: 'https://fusiontables.googleusercontent.com/fusiontables/api/query?sql=SELECT+*+FROM+' + fusionTablesID + '&jsonCallback=?',
            success: function(data) {
                callback(false, exports.formatData(data))
            },
            error: function(err) {
                callback(err)
            }
        })
    }

    exports.fetchJSON = function(url, cb) {
        $.ajax({
            dataType: 'json',
            url: url,
            success: function(data) {
                cb(false, eval(data))
            },
            error: function(xhr, status, err) {
                cb(err)
            }
        })
    }

    // accepts data from fusion tables JSON API
    exports.formatData = function(data) {
        var cleaned = []
        data.table.rows.forEach(function(row) {
            var cleanRow = {}
            for (var i = 0; i < row.length - 1; i++) {
                cleanRow[data.table.cols[i]] = row[i]
            }
            cleaned.push(cleanRow)
        })
        return {
            venues: cleaned
        }
    }

    exports.showOnMap = function(map, objects) {
        var filter,
            template,
            filterKey,
            filterType = {};

        mapMarkers.forEach(function(marker) {
            if (marker) marker.setMap(null);
        });
        mapMarkers = objects.map(function(obj) {
            var pos,
                marker;

            // if ( !obj.location ) return;

            pos = new google.maps.LatLng(obj.Latitude, obj.Longitude);
            var markerOpts = {
                map: map,
                position: pos
            }
            if (obj.markerURL) markerOpts.icon = obj.markerURL
            marker = new google.maps.Marker(markerOpts);
            marker.setVisible(true);

            google.maps.event.addListener(map, 'click', function() {
                closeInfoWindow();
            });

            google.maps.event.addListener(marker, 'click', function() {

                if (isInfoWindowOpen()) closeInfoWindow();

                Object.keys(obj).map(function(key) {
                    filter = {};
                    filterKey = key.replace(/[^A-Z0-9]/ig, "_");
                    filterKey = filterKey.toLowerCase();

                    filter.name = key;
                    filter.value = obj[key];

                    if (obj[key]) filterType[filterKey] = filter;
                });

                template = _.template($('.info-window-content-template').html());
                template = template(filterType);

                exports.infoWindow = new google.maps.InfoWindow();
                exports.infoWindow.setContent(template);
                exports.infoWindow.open(map, marker);
            });

            return marker;
        });
    };

    exports.isInfoWindowOpen = function() {
        if (typeof infoWindow === 'undefined') return false;
        return (infoWindow.getMap() !== 'null');
    };

    exports.closeInfoWindow = function() {
        if (typeof infoWindow === 'undefined') return;
        infoWindow.close();
    };

    exports.filter = function(objects, conditions) {
      //Make sure each object passes at least one filter in each type
      var typesOfConditions = _.values(_.groupBy(conditions, 'type'));

      return _.filter(objects, function(object){
        return _.all(typesOfConditions, function(conditions){
          return _.any(conditions, function(condition){
            return condition.filter(object);
          })
        })
      });

    }

    exports.getAllChecked = function() {
        var filters = []
        $('input:checkbox:checked').map(function(i, input) {
            var entry = $(input).parent()
            var tuple = [entry.attr('data-key'), entry.attr('data-value')]
            filters.push(tuple)
        })
        return filters
    }

    exports.buildConditions = function(filters) {
        var conditions = []
        filters.forEach(function(filter) {
            var condition;
            if (filter[0] === "RegulatoryType") {
                condition = {
                    type: "RegulatoryType",
                    filter: function(obj) {
                        if (filter[1] === "Licensed") {
                            return _.contains(["Licensed, Class I", "Licensed, Class II", "Licensed"], obj.RegulatoryType);
                        } else if (filter[1] === "Registered") {
                            return _.contains(["Not Licensed, Registered", "Not Licensed, Registered, Meets Voluntary Certification Program Standards"], obj.RegulatoryType);
                        } else {
                            return obj.RegulatoryType === 'Not Licensed or Registered, Ask Program for Details';
                        }
                    }
                }


            } else if (filter[0] === "Age") {
                condition = {
                    type: "Age",
                    filter: function(obj) {
                        if (filter[1] === "Under 3 Years") {
                            return obj.MinAge < 94672800;
                        } else if (filter[1] === "3-5 Years") {
                            return obj.MinAge <= 94672800 && obj.MaxAge >= 157788000;
                        } else if (filter[1] === "3-8 Years") {
                            return obj.MinAge <= 94672800 && obj.MaxAge > 252460800;
                        } else if (filter[1] === "3-12 Years") {
                            return obj.MinAge <= 94672800 && obj.MaxAge > 378691200;
                        }
                    }
                }
            } else if (filter[0] === "Financial Assistance Options") {
                condition = {
                    type: "Financial Assistance Options",
                    filter: function(obj) {
                        if (filter[1] === "CCDF vouchers") {
                            return _.intersection(["Approved for CCDF Vouchers", "Approved for CCDF VouchersNULL"], obj.FeeAssistance.split(',')).length > 0;
                        } else if (filter[1] === "Discount for more than one child") {
                            return _.intersection(["Multi Child Discount", " Multi Child Discount"], obj.FeeAssistance.split(',')).length > 0;
                        } else if (filter[1] === "Sliding fee scale") {
                            return _.intersection([" Sliding Fee Scale", "Sliding Fee Scale"], obj.FeeAssistance.split(',')).length > 0;
                        } else if (filter[1] === "Scholarships") {
                            return _.intersection([" Scholarships", "Scholarships"], obj.FeeAssistance.split(',')).length > 0;
                        } else if (filter[1] === "Employer/college supported discounts") {
                            return _.intersection([" Employer/College Supported Discount", ], obj.FeeAssistance.split(',')).length > 0;
                        }
                    }
                }
            } else {
                condition = {
                    type: filter[0],
                    filter: function(obj) {
                        return obj[filter[0]] === filter[1]
                    }
                }
            }
            conditions.push(condition)
        })
        return conditions
    }
    exports.createResultsList = function(obj) {
        //create results list embed in marker loop for closure
    }
})(window)