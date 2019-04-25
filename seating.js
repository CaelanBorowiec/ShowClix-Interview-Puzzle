// Define different states for reservations
const reservationType = {
  INVALID: undefined,
  NONE: 0,
  STANDARD: 1,
  VIP: 2
}

/**
* Seating class
* @param int: rows - the number of rows in the seating layout
* @param int: columns - the number of columns (seats per row) in the seating layout
* @return None
*/
class seatingChart {
  constructor(rows, columns)
  {
    this.rows = rows; // Number of rows in the seating area
    this.rowLength = columns; // Number of seats per row
    this.totalSeats = this.rows * this.rowLength; // Store the total number of seats
    this.freeSeats = this.totalSeats; // initialize a value for free seats
    if (this.totalSeats < 1) // Make sure the layout is valid
      throw "This seating arrangement has no seats.";

    this.rowDetails = new Array(this.rows); // Create an array for row metadata

    // Create a seat grid
    var seatGrid = [];
    // Set up an empty row
    var emptyRow = new Array(this.rowLength);
    emptyRow.fill(reservationType.NONE); // Fill all the cells in the row with 'no reservation'
    // Set up a 2D array
    for (let i = 0; i < this.rows; i++)
    {
      seatGrid[i] = emptyRow.slice(); // Use slice to clone the existing 1D array
      // Set some metadata for the row
      this.rowDetails[i] = {
        freeSeats: this.rowLength,
        largestGroup: this.rowLength,
        firstFree: 0
      }
    }
    this.allSeats = seatGrid; // Assign our fresh 2D array
    //End of constructor
  }


  /**
   * Returns if a seat is valid.
   * @param row - row number of seat
   * @param column - column number of seat
   * @return True if the seat is valid.  False otherwise.
   */
  isSeatValid(row, column)
  {
    // Check if the row is invalid, then if the column is invalid
    return (this.allSeats[row-1] != reservationType.INVALID && this.allSeats[row-1][column-1] != reservationType.INVALID);
  }

  /**
   * Returns if a seat is both valid and free.
   * @param row - row number of seat
   * @param column - column number of seat
   * @return True if the seat is valid and free.  False otherwise.
   */
  isSeatFree(row, column)
  {
    // Check if the seat is valid, then if it is set to reservationType.NONE
    return (this.isSeatValid(row, column) && this.allSeats[row-1][column-1] === reservationType.NONE);
  }

  /**
   * Returns the reservation status of a seat.
   * @param row - row number of seat
   * @param column - column number of seat
   * @return undefined if the seat does not exist, otherwise a reservationType value.
   */
  getSeatReservation(row, column)
  {
    if (!this.isSeatValid(row, column))
      return reservationType.INVALID; // Not valid, so return invalid.
    else
      return this.allSeats[row-1][column-1]; // Otherwise return the seat value
  }

  /**
   * Accesses the array of seats and marks the specified seat as reserved
   * @param row - row number of seat
   * @param column - column number of seat
   * @param count (optional) - the number of seats to reserve in the row, starting from 'column'
   * @param reserveFlag (optional) - the reservationType to set for these seats
   * @return True if the seat has been reserved.  False in the event of a failure.
   */
  reserveSeat(row, column, count=1, reserveFlag=reservationType.STANDARD)
  {
    // First lets make sure all the seats are valid before doing anything else
    for (let ticket = 0; ticket < count; ticket++)
    {
      if (!this.isSeatFree(row, column + ticket))
        return false; // a seat in this range was taken or invalid
    }

    //Okay, reserve the seats
    for (let ticket = 0; ticket < count; ticket++)
    {
      this.allSeats[row-1][column-1+ticket] = reserveFlag; // Set the reservation value on the seat
      this.freeSeats--; // Deincrement the total free seats
      this.rowDetails[row-1].freeSeats--; // Deincrement the free seats for the row
    }
    this.rowDetails[row-1].largestGroup = this.findLargestGroup(row); // At the end of updating, lets also calculate the largest free space in the row, and cache it.

    return true;
  }


    /**
     * Clears the reservation for a seat or group of seats
     * @param row - row number of seat
     * @param column - column number of seat
     * @param count (optional) - the number of seats to clear in the row, starting from 'column'
     * @return True if the seats have been cleared.  False in the event of an invalid request.
     */
    cancelSeatReservation(row, column, count=1)
    {
      if (!this.isSeatValid(row, column) || this.rowLength < (column+count-1))
        return false; // If the target seat is invalid, or we would overflow the row, return false.

      for (let ticket = 0; ticket < count; ticket++)
      {
        this.allSeats[row-1][column-1+ticket] = reservationType.NONE; // Set the seat to unreserved
        this.freeSeats++; // Add 1 back to the total free seats counter
        this.rowDetails[row-1].freeSeats++; // Add 1 back to the free seats counter for the row
      }
      this.rowDetails[row-1].largestGroup = this.findLargestGroup(row); // Recalculate and cache the largest free group of seats in the row
      return true;
    }

  /**
   * Returns the largest free contiguous group of seats in a row
   * @param row - row number to check
   * @return int count of seats in the largest empty space.  Will return 0 if the row is full.
   */
  findLargestGroup(row)
  {
    var count = 0;
    var largest = 0;
    for (let i = 1; i <= this.rowLength; i++) // each seat in the row
    {
      if (this.isSeatFree(row, i) === true)
        count++; // Seat is free, count up

      if (this.isSeatFree(row, i) === false || i == this.rowLength) //seat is not free or is the last seat
      {
        if (count > largest) // Found a large grouping
          largest = count; // Save it
        //reset count, and keep checking
        count = 0;
      }
    }
    return largest; // Largest free group of seats
  }

  /**
   * Searches for empty seat blocks that can accomidate a size of numSeats
   * @param numSeats - The minimum number of empty contiguous seats to search for.
   * @param searchStart - The row to start searching on (eg, 1 for the first row).
   * @param searchEnd - The row to stop searching on.  Use the same as searchStart to only examine one row
   * @return array: An array of objects containing matching seat groups with the following details:
   * Object: {row: number, firstseat: seatnumber, size:groupsize}
   */
  findEmptyGroups(numSeats, searchStart=1, searchEnd=this.rows)
  {
    if (numSeats > this.rowLength || numSeats < 1 || searchEnd < searchStart) //more seats than in a row, or less than 1 seat requested, or search starts after search stops.
      return -1;

    var seatGroups = []; // Create an empty array

    // For each row in the search range
    for (var row = searchStart; row <= searchEnd; row++)
    {
      if (this.rowDetails[row-1].largestGroup < numSeats) // Check cache value and see if this row has any groups big enough
      continue; //If not, move to the next row

      // Otherwise, start counting seats
      var count = 0;
      var groupStart = undefined;
      for (var column = 1; column <= this.rowLength; column++)
      {
        if (this.isSeatFree(row, column) === true)
        {
          count++; // Seat is free, count up
          if (groupStart == undefined)
            groupStart = column; // Save our position when we see the first empty seat
        }

        // If the seat is not free, or we hit the end of the row:
        if (this.isSeatFree(row, column) === false || column == this.rowLength) //seat is not free or is the last seat
        {
          if (count >= numSeats) // This group can fit here
          {
            //store the group
            seatGroups.push({
              row: row,
              firstseat: groupStart,
              size: count
            });
          }
          //reset count, and keep checking
          count = 0;
          groupStart = undefined;
        }
      }
    }

    return seatGroups;
  }


  /**
   * Find the optimal seating location for a group
   * @param seats - the number of contiguous seats to reserve
   * @return Array (or -1 on failure): The starting seat [row, column] for a set of seats with the lowest manhattan distance which will accommodate the group size
   */
  findBestSeats(numSeats)
  {
    if (numSeats > this.rowLength || numSeats < 1) //more seats than in a row, or less than 1 seat requested.
      return -1;

    var rowMiddle = (this.rowLength+1)/2; // The middle of the seats in the row
    var bestPosition = undefined;
    var shortestDistance = undefined;
    for (let row = 0; row < this.rows; row++) // For each row
    {
      var seatingOptions = this.findEmptyGroups(numSeats, row+1, row+1); // Ask for results in a single row
      if (seatingOptions == -1 || seatingOptions.length == undefined || seatingOptions.length < 1)
        continue; // No results in this row, go to the next one

      for (let group = 0; group < seatingOptions.length; group++) // For each group of seats in the row
      {
        // Formula for the middle of a group:
        // offset of the seat placement minus 1 to avoid double-counting the first seat. Then add (seats + 1)/2:
        //    The middle of 4 seats is between seats, so 4+1=5: 5/2=2.5
        //    The middle of 5 seats is the 3rd seat, so 5+1=6: 6/2=3
        let groupMiddle = seatingOptions[group].firstseat - 1 + ((numSeats + 1) / 2);
        // The position of the first seat, + the total number of seats, -1 so we don't double count the first seat.
        let lastSeat = seatingOptions[group].firstseat + numSeats - 1;

        //While the gap has more seats than the requested number, the middle of the group is before the middle of the row, AND the first seat after the group is free
        while (seatingOptions[group].size > numSeats && groupMiddle < rowMiddle && this.isSeatFree(seatingOptions[group].row, lastSeat + 1))
        {
          seatingOptions[group].firstseat ++; // Shift the group right by 1
          groupMiddle ++;
          lastSeat ++;
        }

        //Group is now center aligned in the empty space, or as close as possible.
        let distance = this.getManhattanDistance(seatingOptions[group].row, groupMiddle)
        if (bestPosition == undefined || distance < shortestDistance)
        {
          bestPosition = [seatingOptions[group].row, seatingOptions[group].firstseat, distance];
          shortestDistance = distance;
        }

        if (Math.floor(shortestDistance) <= seatingOptions[group].row)
          return bestPosition;
      }
    }
    return bestPosition;
  }

  /**
	 * Get the Manhattan distance of a seat from the center column of the front row
	 * @param row - row number of seat
	 * @param column - column number of seat
	 * @return Manhattan distance of seat from the center column of the front row
 */
  getManhattanDistance(row, column)
  {
    let middle = (this.rowLength + 1) / 2;
    return (row - 1) + Math.abs(column - middle);
  }
}
