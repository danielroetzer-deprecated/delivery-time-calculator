moment().format();
date = moment();

$(function() {
  
  $("#today").text(date._d);

  //start calculations
  doDateTimeCalc();

  $("#submit-weekday-time").click(setNewCurrentTime);
});


function doDateTimeCalc() {
  $("#time-select").replaceWith("<select id='time-select'></select>");
  $("#warning").prop("hidden", true);

  var day = date.day(); //get day
  
  if(day === 0) { //in JS, sunday = 0, but we recieve sunday as 7
    day = 7;
  }


  //check if entry exists, if not -> the restaurante is closed on this day
  if (openinghours[day] == undefined || openinghours[day] == null) {
    $("#warning").prop("hidden", false).text("Day is not defined in object, meaning that the restauraunt is closed on this day");
    return 0;
  }

  //add delivery time of 50 minutes
  date.add(parseInt(deliverytime), "m");

  //loop through every entry on this day
  openinghours[day].forEach(function (element) {
    //print openinghours of this day
    $("#openinghours").replaceWith('<ul id="openinghours"></ul>');
    $("#openinghours").append("<li>"+element.from+" - "+element.to+"</li>");

    //define new DateTime variables with the opening time and closing time
    var open = moment(element.from, "HH-mm"); //e.g. moment("11:00", "HH-mm");
    var closed = moment(element.to, "HH-mm");

    //mainly for debugging, if you set the day manually for the date variable, the day difference leads to errors
    open.day(date.day());
    closed.day(date.day());

    //check if closing time is on the next day --> if so, add 1 day to the closing time
    if(closed.isBefore(open)) {
      closed.add(1, "d");
    }
    
    var i;
    //e.g. date.hours() = 18, (element.to.split(":"))[0] = 23 --> 6 loops
    //for every loop, hours gets increased by 1 until it reaches the closing time
    for (let i = date.hours(); i <= closed.hours(); i++) {
      date.hours(i); //increase hours

      
      //4th parameter --> [] means inclusion, () means exclusion
      //--> include "open", exclude "closed"
      if(date.isBetween(open, closed, 'minute', '[)')) {

        appendOption(date.hours(), "00", 1);
        appendOption(date.hours(), "30", 2);
      } else if(i == (element.to.split(":"))[0]) {
        appendOption(date.hours(), "00", 3);
      }
    }

    
  });

  //on change event
  $("#time-selected").change(onOptionChange);
}

//appends options to a select field
//codenumber is used for debugging, so you can exactly say, which option was produced, by which function call
function appendOption(h, m, codenumber) {
  console.log(h,m, codenumber); //helpfull for debugging
  $("#time-select").append("<option value='"+h+m+"'>"+h+":"+m+"</option>");
}

//logs selected option
function onOptionChange(event) {
  console.log($(this).val());
}


function setNewCurrentTime(event) {

  if(($("#weekday").val().length === 0) && ($("#time").val().length === 0)) {
    console.warn("No Input");
    return 0;
  }

  date = moment();
  
  if($("#weekday").val().length !== 0) {
    var newDay = parseInt($("#weekday").val());

    if(isNaN(newDay)) {
      console.error("Wrong Day Input");
      return 0;
    } else if(newDay === 7) {
      date.day(0);
    } else {
      date.day(newDay);
    }
  }else {
    newDay = date.day();
  }

  if($("#time").val().length !== 0) {
    var newTime = $("#time").val();
    var newHours = parseInt(newTime.slice(0, 2));
    var newMinutes = parseInt(newTime.slice(2, 4));

    if(isNaN(newHours) || isNaN(newMinutes)) {
      console.error("Wrong Time Input");
      return 0;
    } else {
      date.hours(newHours);
      date.minutes(newMinutes);
    }
  }

  $("#today").text(date._d);
  doDateTimeCalc();
}