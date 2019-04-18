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
  isSeatFree(row, column)
  {
    // If the seat exists and is free return true.  Otherwise return false.
    return (this.allSeats[row-1][column-1 != undefined && this.allSeats[row-1][column-1] === 0);
  }
  reserveSeat(row, column)
  {
    if (isSeatFree(row, column))
    {
      this.allSeats[row-1][column-1] = 1;
      this.freeSeats--;
      this.rowDetails[row-1].freeSeats--;
      this.rowDetails[row-1].largestGroup = this.findLargestGroup(row);
      return true;
    }
    return false; // Seat was not free or invalid
  }
  findLargestGroup(row)
  {
    var count = 0;
    var largest = 0;
    for (let i = 0; i < this.rowLength; i++)
    {
      if (this.allSeats[row-1][i] === true)
        count++; // Seat is free, count up
      else {
        //seat is not free.
        if (count > largest)
          largest = count;
        //reset count, and keep checking
        count = 0;
      }
    }
    return largest; //todo also return the start location of this block
  }
  firstFreeInRow(row)
  {

  }
}


var seats = new seatingChart();
