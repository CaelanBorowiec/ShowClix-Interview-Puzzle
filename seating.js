class seatingChart {
  constructor()
  {
    this.rows = 3;
    this.rowLength = 11;
    this.totalSeats = this.rows * this.rowLength;
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
    this.seat = seatGrid;
  }

  showGrid()
  {
    console.log(this.seat);
  }

  reserveSeat(row, column)
  {
    if (this.seat[row-1][column-1] === 1) //add check if invalid
      return false;
    else {
      this.seat[row-1][column-1] = 1;
      return true;
    }
  }
}


var seats = new seatingChart();
