function prettyNumber( int, highLimit ){
  if( int >= highLimit ){
    return "$" + Math.round(highLimit/100000)/10 + "M+";
  }else if( int >= 1000000 ){
    return "$" + Math.round(int/100000)/10 + "M";
  }else{
    return "$" + Math.round(int/1000) + "K";
  }
}

if (Meteor.isClient) {
  Template.registerHelper( 'locationStr', function(){
      var ip = headers.getClientIP();

      HTTP.get( "http://ip-api.com/json#" + ip, function( error, response ){
        if ( error ) {
          //console.log( error );
        } else {
          //console.log( response );
          if( !response.data.city ){
            Session.set('location', "" );
          }else{
            Session.set('location', response.data.city + ", " + response.data.region );
          }
        }
      });
      return Session.get("location");
  });

  Session.set("resize", null); 
  Meteor.startup(function () {
    window.addEventListener('resize', function(){
      Session.set("resize", new Date());
    });
  });

  var resizeTimer;

  Template.priceRangePicker.resized = function(){
    if( $('.marker').length ){
      if(!$('.marker-min').data("left")){
        var sliderWidth = $(".price-range-slider").width();
        var markerWidth = $(".marker").first().outerWidth();
        var maxMarker = $(".marker-max").position().left; 
        var minMarker = $(".marker-min").position().left; 
        console.log("maxMarker",maxMarker);
        console.log("minMarker",minMarker);
        var minMarkerPercent = minMarker/sliderWidth*100;
        var maxMarkerPercent = (maxMarker)/sliderWidth*100;
        console.log("maxMarkerPercent",maxMarkerPercent);
        console.log("minMarkerPercent",minMarkerPercent);
        $('.marker-min').data("left", minMarkerPercent + "%");
        $('.marker-max').data("left", maxMarkerPercent + "%");
        console.log( $('.marker-max').data("left") );
      }

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        // Run code here, resizing has "stopped"
        $(".marker-min").css("left", $(".marker-min").data("left")).data("left",null);
        $(".marker-max").css("left", $(".marker-max").data("left")).data("left",null);
      }, 250);

    }

    return Session.get('resize');
  }; 

  Template.priceRangePicker.rendered = function(){
    Meteor.defer( function(){
      $(".marker").draggable({
        axis: "x",
        containment: "parent",
        drag: function( event, ui ){
          var markerWidth = $(this).outerWidth();
          var sliderWidth = $(this).closest(".price-range-slider").width();
          var maxLeftPos = sliderWidth - markerWidth;
          var minMarker = $(".marker-min").position().left; 
          var maxMarker = $(".marker-max").position().left; 
          
          // Handle label collision
          var difference = maxMarker - minMarker;
          switch( true ){
            case difference < 60:
              $(".marker-max .marker-label").addClass("label-above");
              break;
            case difference >= 60 && difference < 150:
              $(".label-avg-price").addClass("hidden");
              $(".marker-max .marker-label").removeClass("label-above");
              break;
            case difference >= 150 && difference < 250:
              $(".label-avg-price").removeClass("hidden").addClass("label-above");
              break;
            case difference >= 250:
              $(".label-avg-price").removeClass("label-above");
              break;
          }
          
          // Setup Min and Max bound limitations for markers
          if( $(this).hasClass("marker-min") ){
            ui.position.left = Math.min( ui.position.left, maxMarker - markerWidth);
          }else{
            ui.position.left = Math.min( maxLeftPos, ui.position.left);
            ui.position.left = Math.max( ui.position.left, minMarker + markerWidth);
          }


          // Setup the labels for marker limits
          var lowLimit = 85000;
          var highLimit = 2500000;
          var deltaLimit = highLimit - lowLimit;
          var minMarkerPercent = minMarker/sliderWidth;
          var maxMarkerPercent = (maxMarker + markerWidth)/sliderWidth;
          var minInt = deltaLimit * minMarkerPercent + lowLimit;
          var maxInt = deltaLimit * maxMarkerPercent + lowLimit;
          var minText = prettyNumber(minInt, highLimit);
          var maxText = prettyNumber(maxInt, highLimit);
          $(".marker-min .marker-label").text( minText );
          $(".marker-max .marker-label").text( maxText );

          // Setup the label for average
          var average = (maxMarker + minMarker)/2 + markerWidth/2;
          var avgMarkerPercent = average/sliderWidth;
          var avgInt = deltaLimit * avgMarkerPercent + lowLimit;
          var avgText = prettyNumber( avgInt, highLimit ) + " Average";
          $(".label-avg-price").css("left", average).text( avgText );

          // Setup the highlight bar positioning with 2% buffer under marker
          $(".price-range-bar .highlight").css({
            "left" : minMarkerPercent*100+2 +"%",
            "right" : 102 - maxMarkerPercent*100 + "%"
          });

        }
      });
    });
  }

  Template.propTypePicker.events({
    'click .prop-type-option': function (event) {
      $(event.currentTarget).toggleClass("selected");
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

Meteor.methods({
  fooBar: function(text){
    // do something
  }
});
