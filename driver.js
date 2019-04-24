var puppetShow = new seatingChart(3, 11); //Create a seating group of 3 rows and 11 columns
var input = "R1C4 R1C6 R2C3 R2C7 R3C9 R3C10\n3\n3\n3\n1\n10"; // Todo replace placeholder with actual user input method
var lines = input.split('\n');
var regex = /[Rr](\d)[Cc](\d*)/;
for(var i = 0; i < lines.length; i++)
{
  if (i === 0 && lines[i] != "")
  {
    //First line: Set up initial reservations
    var groups = lines[i].split(' ');
    for (var group = 0; group < groups.length; group++)
    {
      var match = regex.exec(groups[group]);
      if (puppetShow.reserveSeat(parseInt(match[1]), parseInt(match[2]), 1, 2))
        console.log("Reserved seat at: Row", match[1], "Column", match[2]);
    }
  }
  else
  {
    //All following lines: Reserve groups.
    let numSeats = parseInt(lines[i]);
    let bestseats = puppetShow.findBestSeats(numSeats);
    if (bestseats != undefined && bestseats != -1)
    {
      let reserved = puppetShow.reserveSeat(bestseats[0], bestseats[1], numSeats);
      if (!reserved)
      {
        console.log("An error occurred reserving", numSeats, "seats");
        continue;
      }

      let firstSeat = "R" + bestseats[0] + "C" + bestseats[1];
      if (numSeats == 1)
        console.log("Reserved seat", firstSeat);
      else
      {
        let lastSeat = "R" + bestseats[0] + "C" + (bestseats[1] + numSeats -1);
        console.log("Reserved seats: ", firstSeat, '-', lastSeat);
      }
    }
    else
      console.log("Not Available.");
  }
}

console.log("The remaining number of seats is:", puppetShow.freeSeats);
