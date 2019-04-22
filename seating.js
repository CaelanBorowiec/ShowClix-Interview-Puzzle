// Row class?
// Track largest free group
// Track total free seats in row


class seatingChart {
  constructor()
  {
    this.rows = 3;
    this.rowLength = 11;
    this.totalSeats = this.rows * this.rowLength;
    this.freeSeats = this.totalSeats;
    if (this.totalSeats < 1)
      throw "This seating arrangement has no seats.";

    this.reservedTo = "";
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

  showGrid()
  {
    console.log(this.allSeats);
    console.log("Free seats: " + this.freeSeats);
    console.log(this.rowDetails);
  }

  /**
   * Returns if a seat is both valid and free.
   * @param row - row number of seat
   * @param column - column number of seat
   * @return True if the seat is valid and free.  False otherwise.
   */
  isSeatFree(row, column)
  {
    return (this.allSeats[row-1][column-1] != undefined && this.allSeats[row-1][column-1] === 0);
  }

  /**
   * Accesses the array of seats and marks the specified seat as reserved
   * @param row - row number of seat
   * @param column - column number of seat
   * @return True if the seat has been reserved.  False in the event of a failure.
   */
  reserveSeat(row, column)
  {
    if (this.isSeatFree(row, column))
    {
      this.allSeats[row-1][column-1] = 1;
      this.freeSeats--;
      this.rowDetails[row-1].freeSeats--;
      this.rowDetails[row-1].largestGroup = this.findLargestGroup(row);
      return true;
    }
    return false; // Seat was not free or invalid
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
   * Find the optimal seating location for a group
   * @param seats - the number of contiguous seats to reserve
   * @return The first row with space
   * @return todo: the starting seat (row/column) for a set of seats with the lowest manhattan distance which will accommodate the group size
   */
  findBestSeats(numSeats)
  {
    if (numSeats > this.rowLength)

    for (let i = 1; i <= this.rows; i++)
    {
      if (this.findLargestGroup(i) < numSeats)  // This number can't fit in this row
        continue; //End the loop early.

      return i;  // just return the row for now
    }
    return -1;
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


var seats = new seatingChart();
seats.reserveSeat(1,6)
seats.reserveSeat(1,3)
seats.reserveSeat(1,1)
seats.reserveSeat(2,5)
