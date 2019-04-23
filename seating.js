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
    return largest; //todo also return the start location of this block
  }

  /**
   * Searches for empty seat blocks that can accomidate a size of numSeats
   * @param numSeats - The minimum number of empty contiguous seats to search for.
   * @return array: An array of objects containing matching seat groups with the following details:
   * Object: {row: number, firstseat: seatnumber, size:groupsize}
   */
  findEmptyGroups(numSeats)
  {
    if (numSeats > this.rowLength || numSeats < 1) //more seats than in a row, or less than 1 seat requested. todo: also check if the stored largest group is big enough
      return -1;

    var seatGroups = [];

    for (var row = 1; row <= this.rows; row++)
    {
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
   * @return The first row with space
   * @return todo: the starting seat (row/column) for a set of seats with the lowest manhattan distance which will accommodate the group size
   */
  findBestSeats(numSeats)
  {
    if (numSeats > this.rowLength || numSeats < 1) //more seats than in a row, or less than 1 seat requested.
      return -1;

    var seatingOptions = this.findEmptyGroups(numSeats);
    var rowMiddle = Math.round(this.rowLength/2); // The middle column
    var bestPosition = undefined;
    var bestScore = undefined;
    for (let i = 0; i < seatingOptions.length; i++) // For each group of seats
    {
      let groupMiddle = seatingOptions[i].firstseat + Math.floor(numSeats/2);

      //Todo: combine this statement with the while loop
      if (seatingOptions[i].size == numSeats || groupMiddle == rowMiddle)  // No further optimization for this group: Score it.
      {
        //Get the middle most seat of the group and calculate the manhattan distance for it
        let score = this.getManhattanDistance(seatingOptions[i].row, groupMiddle)
        if (bestPosition == undefined || score < bestScore)
        {
          bestPosition = [seatingOptions[i].row, seatingOptions[i].firstseat];
          bestScore = score;
        }
        continue;
      }

      // There is extra space in the block to move to the right
      let lastSeat = seatingOptions[i].firstseat + numSeats - 1; // The position of the first seat, plus the total number of seats, minus 1 since we don't need to count the first seat again.
      //While the middle of the group is before the middle of the row, AND the first seat after the group is free
      while (groupMiddle <= rowMiddle && this.isSeatFree(seatingOptions[i].row, lastSeat + 1))
      {
        seatingOptions[i].firstseat ++; // Shift the group right by 1
        groupMiddle ++;
        lastSeat ++;
      }

      //Group is now center aligned in the empty space, or as close as possible.
      let score = this.getManhattanDistance(seatingOptions[i].row, groupMiddle)
      if (bestPosition == undefined || score < bestScore)
      {
        bestPosition = [seatingOptions[i].row, seatingOptions[i].firstseat];
        bestScore = score;
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

//Test cases
var seats = new seatingChart(3, 11);
seats.reserveSeat(1,6)
seats.reserveSeat(1,3)
seats.reserveSeat(1,1)
seats.reserveSeat(2,5)
