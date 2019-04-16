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

    // Create a seat grid
    var seatGrid = [];
    // Set up an empty row
    var emptyRow = new Array(this.rowLength);
    emptyRow.fill(0);
    // Set up a 2D array
    for (var i = 0; i < this.rows; i++)
    {
      seatGrid[i] = emptyRow.slice();
    }
    this.allSeats = seatGrid;
  }

  showGrid()
  {
    console.log(this.allSeats);
    console.log("Free seats: " + this.freeSeats);
  }

  reserveSeat(row, column)
  {
    if (this.allSeats[row-1][column-1] === 1) //add check if invalid
      return false;
    else {
      this.allSeats[row-1][column-1] = 1;
      this.freeSeats--;
      return true;
    }
  }
  firstFreeInRow(row)
  {

  }
}


var seats = new seatingChart();
