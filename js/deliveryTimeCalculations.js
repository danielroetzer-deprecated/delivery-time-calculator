$(function() {
  moment().format();
  var date = moment();

  $("#currentTime").text(date._d);

  //print openinghours for the whole week
  printAllOpeningHours();

  //start calculations
  doDateTimeCalc(date);

  $("#submit-weekday-time").click(setNewCurrentTime);

  $("#time").keypress(keyPressed);
  $("#weekday").keypress(keyPressed);
});


function doDateTimeCalc(date) {
  //$("#time-select").replaceWith('<select id="time-select"></select>');

  var day = date.day(); //get day
  
  if(day === 0) { //in JS, sunday = 0, but we recieve sunday as 7
    day = 7;
  }


  //check if entry exists, if not -> the restaurante is closed on this day
  if (openinghours[day] == undefined || openinghours[day] == null) {
    displayInfo("Restaurant has closed on this day");
    $("#time-select").append("<li>Restaurant is closed on this day</li>");
    return 0;
  }

  $("#success").prop("hidden",false);
  if(date.minutes() < 10) {
    $("#success").text("New Day: " + day + ", New Time: " + date.hours() + ":0" + date.minutes());
  } else {
    $("#success").text("New Day: " + day + ", New Time: " + date.hours() + ":" + date.minutes());
  }

  //add delivery time of 50 minutes
  date.add(parseInt(deliverytime), "m");
  console.warn(date._d);

  //loop through every entry on this day
  openinghours[day].forEach(function (element) {
    //print openinghours of this day
    $("#openinghours").append("<li>"+element.from+" - "+element.to+"</li>");

    //define new DateTime variables with the opening time and closing time
    var open = moment(element.from, "HH-mm"); //e.g. moment("11:00", "HH-mm");
    var closed = moment(element.to, "HH-mm");

    //mainly for debugging, if you set the day manually for the date variable, the day difference leads to errors
    open.day(date.day());
    closed.day(date.day());

    var closedhours = closed.hours();

    //check if closing time is on the next day --> if so, add 1 day to the closing time
    if(closed.isBefore(open)) {
      closed.add(1, "d");
      closedhours += 24;
    }

    console.log(closed._d, open._d);

    /*if(date.isBefore(open)) {
      console.warn("jajalksf");

      var help = open;
      //help.minutes(0);
      while(help.isBetween(open, closed, "minutes", '[)')) {

        if(open.minutes() !== 0) {
          help.add(1, 'h');
        }

        
        appendOption(help.hours(), "00", "A");
        appendOption(help.hours(), "30", "A");
        help.add(1, 'h');
      }

      console.log(help._d);
    } else {
      
    }*/

    
    
    var i;
    //e.g. date.hours() = 18, (element.to.split(":"))[0] = 23 --> 6 loops
    //for every loop, hours gets increased by 1 until it reaches the closing time
    for (i = date.hours(); i <= closedhours; i++) {
      loopDate = date;
      loopDate.hours(i); //increase hours
      console.log(loopDate.hours(), closedhours);



      
      //4th parameter --> [] means inclusion, () means exclusion
      //--> include "open", exclude "closed"
      if(loopDate.isBetween(open, closed, 'minute', '[)')) {
        console.log("true");

        if(loopDate.isBetween(open, closed, null, '()')) {
          
        }
        appendOption(loopDate.hours(), "00", 1);
        appendOption(loopDate.hours(), "30", 2);
      } else if(i == (element.to.split(":"))[0]) {
        appendOption(loopDate.hours(), "00", 3);
      }
    }

    

    /*while(date.isBetween(open, closed, 'minute', '[)')) {
      console.log()

      date.hours(date.hours()++);
    }*/

    
  });

}

//appends options to a select field
//codenumber is used for debugging, so you can exactly say, which option was produced, by which function call
function appendOption(h, m, codenumber) {
  if(typeof(m) === "number") {
    if(m<10) {
      m = "0" + JSON.stringify(m);
    }
  }
  //console.log(h,m, codenumber); //helpfull for debugging
  //$("#time-select").append("<option value='"+h+m+"'>"+h+":"+m+"</option>");
  $("#time-select").append("<li>"+h+":"+m+"</li>");
}



function setNewCurrentTime(event) {
  $("#time-select li").remove();
  $("#info").prop("hidden", true);
  $("#success").prop("hidden", true);
  $("#openinghours").replaceWith('<ul id="openinghours"></ul>');

  var date = moment();
  
  if($("#weekday").val().length !== 0) {
    var newDay = parseInt($("#weekday").val());

    if(isNaN(newDay)) {
      displayInfo("Could not convert date input to number");
      return 0;
    } else if(newDay < 1 || newDay > 7) {
      displayInfo("Submitted number for DAY was either too high or too low");
      return 0;
    } else if(newDay === 7) {
      date.day(0);
    } else {
      date.day(newDay);
    }
  }

  if($("#time").val().length !== 0) {
    var newTime = $("#time").val();

    if($("#time").val().length !== 4) {
      displayInfo("TIME needs to be 4 characters long");
      return 0;
    }

    var newHours = parseInt(newTime.slice(0, 2));
    var newMinutes = parseInt(newTime.slice(2, 4));

    if(isNaN(newHours) || isNaN(newMinutes)) {
      console.error("Wrong Time Input");
      return 0;
    } else if(newTime < 0 || newTime > 2400) {
      displayInfo("Submitted number for TIME was either too high or too low");
      return 0;
    } else {
      date.hours(newHours);
      date.minutes(newMinutes);
      date.seconds(0);
    }
  } 

  $("#currentTime").text(date._d);
  doDateTimeCalc(date);
}


function printAllOpeningHours() {
  var html ="";
  html += "<div class='row'>";
    Object.keys(openinghours).forEach(function (_day) {
      
        html += "<div class='col s12 m6 l4'>"+_day +": ";
      
        var help =""
        openinghours[_day].forEach(function (_times) {
          help += ", " + _times.from +" - "+ _times.to;
        });
        html += help.substring(2);

      html += "</div>";
    });
  html += "</div>";
  
  $("#allOpeningHours").append(html);
}

function keyPressed(event) {
  if(event.which == 13) {
    setNewCurrentTime();
  }
}

function displayInfo(msg) {
  $("#info").prop("hidden", false);
  $("#info").text(msg);
}


function test() {
  a = moment("17:00", "HH-mm");
  b = moment("19:00", "HH-mm");
  c = moment("03:00", "HH-mm");
  c.add(1, "d");
  console.log(a._d);
  console.log(b._d);
  console.log(c._d);

  if(b.isBetween(a, c, 'minute', '[)')) {
    console.log("IN BETWEEN");
  } else {
    console.log("FAAALSEE");
  }
}