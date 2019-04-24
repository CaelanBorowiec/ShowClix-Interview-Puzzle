/**
* Seating driver for use with seating.js
* @param int: rows - the number of rows in the seating layout
* @param int: columns - the number of columns (seats per row) in the seating layout
* @param int: maxtickets - the max number of tickets a group can request
* @param DOMid: logElementID - a textarea html element to print log messages to.
* @param DOMid: layoutElementID - a div html element in which to render a seating table.
* @return None
*/
class seatingDriver {
  constructor(rows, columns, maxtickets, logElementID, layoutElementID)
  {
    this.maxtickets = maxtickets;
    // Regex matches R1C2 (Row 1, column 2), or R1C2N3 (Row 1, column 2, seats 3)
    this.regex = /[Rr](\d*)[Cc](\d*)([Nn](\d*))?/;
    this.seating = new seatingChart(rows, columns); //Create a seating group
    this.loggingID = logElementID.replace("#", ""); // eg #log or log.  Action messages will be shown here
    this.layoutID = layoutElementID.replace("#", ""); // eg #layout or layout. A visual rendering of the seating area will be created here.
  }

  /**
   * Main function, should be called when user input is captured.
   * @param input - user input for processing
   * @return None
   */
  onUserInput(input)
  {
    let lines = input.split('\n'); // Split the input by line
    // For each line:
    for(var i = 0; i < lines.length; i++)
    {
      if (i === 0 && lines[i] != "" && this.regex.test(lines[i])) //First line, not empty, and matches the regex pattern.
      {
        this.reserveInitialSeats(lines[i]); //Set up initial 'VIP' reservations
      }
      else if (lines[i] != "" && !isNaN(lines[i])) //Else not empty, and contains a number.
      {
        //Reserve groups using the seating algorithm.
        if (!this.reserveSeatGroup(lines[i]))
          continue;
      }
    }

    // Always print the remaining number of seats and show the visual layout
    this.logToPage("The remaining number of seats is:", this.seating.freeSeats);
    this.renderHTMLTable();
  }

/**
 * Reserves seats specified in the R1C2 or R1C2N3 format.
 * @param line - A string containing space deliminated seat blocks in the format mentioned above.
 * @return None
 */
  reserveInitialSeats(line)
  {
    // Split space delimited groups then loop each
    let groups = line.split(' ');
    for (var group = 0; group < groups.length; group++)
    {
      let match = this.regex.exec(groups[group]); //Match with regex to get the numbers for row, column, and seat count
      let seats = 1; // Default seat count
      if (match[4] != undefined) // The R#C#N# format was used
        seats = parseInt(match[4]); // Update the number of seats to reserve

      // Reserve the seat(s), marking them as VIP
      if (this.seating.reserveSeat(parseInt(match[1]), parseInt(match[2]), seats, reservationType.VIP))
        this.logToPage("Reserved", seats, "VIP seat(s) at: Row", match[1], "Column", match[2]); // Print a basic message
    }
  }

/**
 * Reserves a group of seats in the best available location.
 * @param seats - A number of contiguous seats to find and reserve.
 * @return False on failure
 */
  reserveSeatGroup(seats)
  {
    let numSeats = parseInt(seats);
    if (numSeats > this.maxtickets)
    {
      this.logToPage("The max number of tickets that you can reserve is", this.maxtickets)
      return false;
    }

    let bestseats = this.seating.findBestSeats(numSeats);
    if (bestseats != undefined && bestseats != -1)
    {
      let reserved = this.seating.reserveSeat(bestseats[0], bestseats[1], numSeats);
      if (!reserved)
      {
        this.logToPage("An error occurred reserving", numSeats, "seats");
        return false;
      }

      let firstSeat = "R" + bestseats[0] + "C" + bestseats[1];
      if (numSeats == 1)
        this.logToPage("Reserved seat", firstSeat);
      else
      {
        let lastSeat = "R" + bestseats[0] + "C" + (bestseats[1] + numSeats -1);
        this.logToPage("Reserved seats: ", firstSeat, '-', lastSeat);
      }

      return true;
    }
    else
    {
      this.logToPage("Not Available.");
      return false;
    }
  }

  logToPage()
  {
    let container = document.getElementById(this.loggingID);
    if (container == null)
      return false

    // Append strings similar to console.log
    var messageString = "";
    for (let i = 0; i < arguments.length; ++i)
    {
      messageString += arguments[i];
      if (i != arguments.length +1)
        messageString += " ";
    }

    // Just output to console.log for now:
    console.log(messageString);
    container.value += messageString + "\n" || messageString;
    return true;
  }



  renderHTMLTable()
  {
    let container = document.getElementById(this.layoutID);
    if (container == null)
      return false

    var htmlTable = "<table id='seatinglayout'>";
    for (let row = 0; row < this.seating.rows; row++)
    {
      htmlTable += "<tr>";
      for (let column = 0; column < this.seating.rowLength; column++)
      {
        let seatValue = this.seating.getSeatReservation(row+1, column+1);
        switch (seatValue)
        {
          case reservationType.NONE:
            seatValue = "O";
            break;
          case reservationType.STANDARD:
            seatValue = "X";
            break;
          case reservationType.VIP:
            seatValue = "V"
            break;
        }
        htmlTable += "<td class='color" + seatValue + "'>"+ seatValue +"</td>";
      }
      htmlTable += "</tr>";
    }
    htmlTable += "</table>";
    htmlTable += "<p>O = Open, X = Reserved, V = VIP Reserved</p>"
    container.innerHTML = htmlTable;

    return true;
  }
}
