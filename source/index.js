$(window).resize(function () {
  var h = $(window).height(),
    offsetTop = 90; // Calculate the top offset

  $('#map_canvas').css('height', (h - offsetTop));
}).resize();

$(function() {
  
  var allData
  var resultList = "No sites found";
   	
  MapsLib.initialize();
  
  // fetch directly from fusion tables
  // fetchFusionTablesData(MapsLib.fusionTableId, function(err, data) {
  //   showOnMap(map, data.venues)
  // })
  
  
  // fetch from a json file
  fetchJSON('schools.json', function(err, data) {
    if (err) return alert(JSON.stringify(err))
    data.map(function(item) { 
      item.markerURL = "images/red-dot.png"
      if (item.Type === 'OUSD') {
        item.markerURL = "images/red-dot.png"
      } else if (item.Type === 'Alternate') {
        item.markerURL = "images/green-dot.png"
      } else {
        item.markerURL = "images/yellow-dot.png"
      }
    })
    allData = data
    //create results count
    $("#result_count").text(allData.length + " sites found");
    showOnMap(map, data) //create markers
    $("#result_list").text(resultList);
  })
  
  $("#search_address").geocomplete();

  $(':checkbox').click(function(e){
    var filters = getAllChecked()
    var filtered
    if (filters.length === 0) filtered = allData
    else filtered = filter(allData, buildConditions(filters))
    //create result count
    $("#result_count").text(filtered.length	 + " sites found");
    showOnMap(map, filtered)
    
  });
  
  $('#search').click(function(){
    MapsLib.doSearch();
  });
  
  $('#find_me').click(function(){
    MapsLib.findMe(); 
    return false;
  });
  
  $(":text").keydown(function(e){
      var key =  e.keyCode ? e.keyCode : e.which;
      if(key == 13) {
          $('#search').click();
          return false;
      }
  });
});
