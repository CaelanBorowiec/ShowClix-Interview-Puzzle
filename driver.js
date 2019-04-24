class seatingDriver {
  constructor(rows, columns, maxtickets)
  {
    this.maxtickets = maxtickets;
    // Matches R1C2 (Row 1, column 2), or R1C2N3 (Row 1, column 2, seats 3)
    this.regex = /[Rr](\d*)[Cc](\d*)([Nn](\d*))?/;
    this.seating = new seatingChart(rows, columns); //Create a seating group
  }

  /**
   * Main function, should be called when user input in captured.
   * @param input - user input for processing
   * @return None
   */
  onUserInput()
  {
    let input = "R1C4 R1C6 R2C3 R2C7 R3C9 R3C10\n3\n3\n3\n1\n10"; // Todo replace placeholder with actual user input method

    let lines = input.split('\n');

    for(var i = 0; i < lines.length; i++)
    {
      if (i === 0 && lines[i] != "")
      {
        //First line: Set up initial reservations
        this.reserveInitialSeats(lines[i]);
      }
      else
      {
        //All following lines: Reserve groups.
        if (!this.reserveSeatGroup(lines[i]))
          continue;
      }
    }

    console.log("The remaining number of seats is:", this.seating.freeSeats);
  }

/**
 * Reserves seats specified in the R1C2 or R1C2N3 format.
 * @param line - A string containing space deliminated seat blocks in the format mentioned above.
 * @return None
 */
  reserveInitialSeats(line)
  {
    let groups = line.split(' ');
    for (var group = 0; group < groups.length; group++)
    {
      let match = this.regex.exec(groups[group]);
      let seats = 1;
      if (match[4] != undefined)
        seats = parseInt(match[4]);

      if (this.seating.reserveSeat(parseInt(match[1]), parseInt(match[2]), seats, 2))
        console.log("Reserved seat at: Row", match[1], "Column", match[2]);
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
      console.log("The max number of tickets that you can reserve is", this.maxtickets)
      return false;
    }

    let bestseats = this.seating.findBestSeats(numSeats);
    if (bestseats != undefined && bestseats != -1)
    {
      let reserved = this.seating.reserveSeat(bestseats[0], bestseats[1], numSeats);
      if (!reserved)
      {
        console.log("An error occurred reserving", numSeats, "seats");
        return false;
      }

      let firstSeat = "R" + bestseats[0] + "C" + bestseats[1];
      if (numSeats == 1)
        console.log("Reserved seat", firstSeat);
      else
      {
        let lastSeat = "R" + bestseats[0] + "C" + (bestseats[1] + numSeats -1);
        console.log("Reserved seats: ", firstSeat, '-', lastSeat);
      }

      return true;
    }
    else
    {
      console.log("Not Available.");
      return false;
    }
  }
}
