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
      item.markerURL = "images/new_purple_mark.png"

      if(item.PTQLevel === 'Paths to QUALITY Level 4 - Highest Level'){
        item.markerURL = "images/new_blue_mark.png"
      } else if(item.PTQLevel === 'Paths to QUALITY Level 3') {
        item.markerURL = "images/new_teal_mark.png"
      } else if(item.PTQLevel === 'Paths to QUALITY Level 2') {
        item.markerURL = "images/new_green_mark.png"
      } else if(item.PTQLevel === 'Paths to QUALITY Level 1 - Entry Level') {
        item.markerURL = "images/new_gold_mark.png"
      } else if(_.contains(["Licensed, Class I", "Licensed, Class II",  "Licensed"], item.RegulatoryType)){
        item.markerURL = "images/new_orange_mark.png"
      } else if(_.contains(["Not Licensed, Registered", "Not Licensed, Registered, Meets Voluntary Certification Program Standards"], item.RegulatoryType)){
        item.markerURL = "images/new_red_mark.png"
      } else if(item.RegulatoryType === 'Not Licensed or Registered, Ask Program for Details'){
        item.markerURL = "images/new_purple_mark.png"
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
