const reservationType = {
  INVALID: undefined,
  NONE: 0,
  STANDARD: 1,
  VIP: 2
}

class seatingChart {
  constructor(rows, columns)
  {
    this.rows = rows;
    this.rowLength = columns;
    this.totalSeats = this.rows * this.rowLength;
    this.freeSeats = this.totalSeats;
    if (this.totalSeats < 1)
      throw "This seating arrangement has no seats.";

    this.rowDetails = new Array(this.rows);

    // Create a seat grid
    var seatGrid = [];
    // Set up an empty row
    var emptyRow = new Array(this.rowLength);
    emptyRow.fill(0);
    // Set up a 2D array
    for (let i = 0; i < this.rows; i++)
    {
      seatGrid[i] = emptyRow.slice();
      this.rowDetails[i] = {
        freeSeats: this.rowLength,
        largestGroup: this.rowLength,
        firstFree: 0
      }
    }
    this.allSeats = seatGrid;
  }


  /**
   * Returns if a seat is valid.
   * @param row - row number of seat
   * @param column - column number of seat
   * @return True if the seat is valid.  False otherwise.
   */
  isSeatValid(row, column)
  {
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
      return reservationType.INVALID;
    else
      return this.allSeats[row-1][column-1];
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
      this.allSeats[row-1][column-1+ticket] = reserveFlag;
      this.freeSeats--;
      this.rowDetails[row-1].freeSeats--;
    }
    this.rowDetails[row-1].largestGroup = this.findLargestGroup(row);

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
        return false;

      for (let ticket = 0; ticket < count; ticket++)
      {
        this.allSeats[row-1][column-1+ticket] = reservationType.NONE;
        this.freeSeats++;
        this.rowDetails[row-1].freeSeats++;
      }
      this.rowDetails[row-1].largestGroup = this.findLargestGroup(row);

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
    for (let i = 1; i <= this.rowLength; i++)
    {
      if (this.isSeatFree(row, i) === true)
        count++; // Seat is free, count up

      if (this.isSeatFree(row, i) === false || i == this.rowLength)
      {
        //seat is not free or is the last seat
        if (count > largest)
          largest = count;
        //reset count, and keep checking
        count = 0;
      }
    }
    return largest;
  }

  /**
   * Searches for empty seat blocks that can accomidate a size of numSeats
   * @param numSeats - The minimum number of empty contiguous seats to search for.
   * @return array: An array of objects containing matching seat groups with the following details:
   * Object: {row: number, firstseat: seatnumber, size:groupsize}
   */
  findEmptyGroups(numSeats)
  {
    if (numSeats > this.rowLength || numSeats < 1) //more seats than in a row, or less than 1 seat requested.
      return -1;

    var seatGroups = [];

    for (var row = 1; row <= this.rows; row++)
    {
      if (this.rowDetails[row-1].largestGroup < numSeats)
      continue;

      var count = 0;
      var groupStart = undefined;
      for (var column = 1; column <= this.rowLength; column++)
      {
        if (this.isSeatFree(row, column) === true)
        {
          count++; // Seat is free, count up
          if (groupStart == undefined)
            groupStart = column;
        }

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
   * @return Array: The starting seat [row, column] for a set of seats with the lowest manhattan distance which will accommodate the group size
   */
  findBestSeats(numSeats)
  {
    if (numSeats > this.rowLength || numSeats < 1) //more seats than in a row, or less than 1 seat requested.
      return -1;

    var seatingOptions = this.findEmptyGroups(numSeats);
    if (seatingOptions.length < 1)
      return -1;

    var rowMiddle = (this.rowLength+1)/2; // The middle of the seats in the row
    var bestPosition = undefined;
    var shortestDistance = undefined;
    for (let i = 0; i < seatingOptions.length; i++) // For each group of seats
    {

      // Formula for the middle of a group:
      // offset of the seat placement minus 1 to avoid double-counting the first seat. Then add (seats + 1)/2:
      //    The middle of 4 seats is between seats, so 4+1=5: 5/2=2.5
      //    The middle of 5 seats is the 3rd seat, so 5+1=6: 6/2=3
      let groupMiddle = seatingOptions[i].firstseat - 1 + ((numSeats + 1) / 2);
      // The position of the first seat, + the total number of seats, -1 so we don't double count the first seat.
      let lastSeat = seatingOptions[i].firstseat + numSeats - 1;

      //While the gap has more seats than the requested number, the middle of the group is before the middle of the row, AND the first seat after the group is free
      while (seatingOptions[i].size > numSeats && groupMiddle < rowMiddle && this.isSeatFree(seatingOptions[i].row, lastSeat + 1))
      {
        seatingOptions[i].firstseat ++; // Shift the group right by 1
        groupMiddle ++;
        lastSeat ++;
      }

      //Group is now center aligned in the empty space, or as close as possible.
      let distance = this.getManhattanDistance(seatingOptions[i].row, groupMiddle)
      if (bestPosition == undefined || distance < shortestDistance)
      {
        bestPosition = [seatingOptions[i].row, seatingOptions[i].firstseat, distance];
        shortestDistance = distance;
      }

      if (Math.floor(shortestDistance) <= seatingOptions[i].row)
        return bestPosition;

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
