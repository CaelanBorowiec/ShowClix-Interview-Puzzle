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
 * @return False on failure, true on success
 */
  reserveSeatGroup(seats)
  {
    let numSeats = parseInt(seats);
    if (numSeats > this.maxtickets) // More seats requested than the max specified at driver program initialization
    {
      this.logToPage("The max number of tickets that you can reserve is", this.maxtickets)
      return false;
    }

    // Ask the seating class for the best seating option
    let bestseats = this.seating.findBestSeats(numSeats);
    if (bestseats != undefined && bestseats != -1)  // Found a valid option
    {
      // Reserve the seats
      let reserved = this.seating.reserveSeat(bestseats[0], bestseats[1], numSeats);
      if (!reserved)
      {
        // An issue occured, so print an error and return false
        this.logToPage("An error occurred reserving", numSeats, "seats");
        return false;
      }

      // Reservation worked, lets build a message
      let firstSeat = "R" + bestseats[0] + "C" + bestseats[1]; // The first seat name
      if (numSeats == 1) // Only one seat, print it!
        this.logToPage("Reserved seat", firstSeat);
      else // More than one seat
      {
        let lastSeat = "R" + bestseats[0] + "C" + (bestseats[1] + numSeats -1); // The name of the last seat in the range
        this.logToPage("Reserved seats: ", firstSeat, '-', lastSeat); // Print a message in the format "Reserved seats: R1C3 - R1C5"
      }

      return true;
    }
    else // No valid seating option was found
    {
      this.logToPage("Not Available."); // Print 'Not Available.' and return
      return false;
    }
  }

/**
 * Accepts any number of parameters, space concatenates them and prints them to the page and browser console.
 * @param any - any number of strings or other browser printable values
 * @return none
 */
  logToPage()
  {
    let container = document.getElementById(this.loggingID);

    // Append all passed parameters similar to console.log
    var messageString = "";
    for (let i = 0; i < arguments.length; ++i)
    {
      messageString += arguments[i];
      if (i != arguments.length +1)
        messageString += " ";
    }

    console.log(messageString); // Log the message to console
    if (container != null) // If a valid DOM element exists, print it there as well
      container.value += messageString + "\n" || messageString;
  }


/**
 * Asks the seating class for the reservation for each seat and builds a table layout
 * The table layout is printed to a DOM element specified when the driver program is initialized
 * @return false if no DOM element found, true otherwise.
 */
  renderHTMLTable()
  {
    // Get the container DOM element
    let container = document.getElementById(this.layoutID);
    if (container == null)
      return false; // It doesn't exist, so nothing to do.

    // Start a variable and open an HTML table
    var htmlTable = "<table id='seatinglayout'>";
    // For each row in the chart:
    for (let row = 0; row < this.seating.rows; row++)
    {
      // Create a table row:
      htmlTable += "<tr>";

      //For each seat in a row:
      for (let column = 0; column < this.seating.rowLength; column++)
      {
        // Get the reservation status of the seat
        let seatValue = this.seating.getSeatReservation(row+1, column+1);
        // Convert the seat value to a letter:
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
        // Create a table cell for each seat, and apply the class "color[Letter]".  Also set the cell value to the same Letter.
        htmlTable += "<td class='color" + seatValue + "'>"+ seatValue +"</td>";
      }
      htmlTable += "</tr>"; // End of the row, close the row.
    }
    htmlTable += "</table>"; // End of the table, close the table.
    htmlTable += "<p>O = Open, X = Reserved, V = VIP Reserved</p>" // Add table legend
    container.innerHTML = htmlTable; // Place the table inside the specified DOM element

    return true;
  }
}
