

# ShowClix Interview Puzzle (Seating Application)

**Background:**  Your younger sister is putting on a puppet show in your family's back yard. She has left you in charge of ticketing the big event. She has informed you that she wants assigned seating. She plans on setting up 33 seats; 3 rows with 11 seats each. She already has several seats reserved for her parents and best friends. Being a good computer scientist, you decide to whip up a quick program to help her out.
Visit [https://www.showclix.com/static/puzzle.html](https://www.showclix.com/static/puzzle.html) for more details.

## Demo
Clone or download this repo, and open **/demo/index.html** in your browser.  This will open up a [demo interface](https://drive.google.com/file/d/1kGqw9TWa51ARb-1T3v-YIQ-8L_LEB299/view?usp=sharing) where you can enter commands in the following format to reserve seats:

First line only: R1C1 or R1C1N3.  Create a VIP reservation for a seat at row 1, column 1, or *three* seats starting at row 1, column 1.

Entering a single number (eg, 3 or 10) on any other line will search for and reserve seats for a group that size.  The smallest possible distance to the front and center of the seating area will be selected, and "not available" will be printed if no seating is found for a group of that size.


## Seating Chart Class:
``var myseatingchart = new seatingChart(rows, columns);``
Creates a seating chart object with a number of properties and methods.
### Seating Chart Properties
The file seating.js defines a "seatingChart" class which has the following properties:
* **.rows:** The number of rows in the seating area.
* **.rowLength:** The number of seats in a row.
* **.totalSeats:** The total number of seats in the layout.
* **.freeSeats:** The number of unoccupied seats in the layout.
* **.rowDetails[row].freeSeats:** The number of unoccupied seats in a specific row.
* **.rowDetails[row].largestGroup:** The largest contiguous empty space in a specific row.
* **.allSeats[row][column]:** 2D array with every seat in the layout.

### Seating Chart Methods
The seatingChart class has a number of methods:

**bool: isSeatValid(row, column)**
Accepts a row, and column, and returns if a seat is valid.

**bool: isSeatFree(row, column)**
Accepts a row, and column, and returns if a seat is empty (also checks isSeatValid).

**any: getSeatReservation(row, column)**
Returns the reservation value of a seat, or reservationType.INVALID if the seat does not exist.

**bool: reserveSeat(row, column, count=1, reserveFlag=reservationType.STANDARD)**
Reserves a seat at the position specified by row and column.  Count can be specified to reserve additional seats adjacent to the target seat.  reserveFlag can be specified to mark the seat with a specific reservation value (eg reservationType.VIP).
Returns true if the seat(s) were reserved, false otherwise.

**bool: cancelSeatReservation(row, column, count=1)**
Marks a seat as free at the position specified by row and column.  Count can be specified to clear additional seats adjacent to the target seat.
Returns true if the seat(s) were cleared, false otherwise.

**int: findLargestGroup(row)**
Returns the number of adjacent seats in the largest free space for a row.

**array: findEmptyGroups(numSeats, searchStart=1, searchEnd=this.rows)**
Returns an array of objects.  Each object has an empty seating block that matches the search parameters.  Parameters are: The number of adjacent free seats to match, the row to start searching on, and the row to stop searching on.
Each object in the array has the following structure:
* **arr[].row**: The row the group is on.
* **arr[].firstseat**:  The column of the first seat in the group.
* **arr[].size**: The number of seats in the group.

**array: findBestSeats(numSeats)**
Searches the seating area and returns the "best" (determined by Manhattan Distance from the front & center of the seating area) seating position for a group of seats.
When the best seating group is found, the returned array will have 3 keys:
* **arr[0]** = row of the seating group
* **arr[1]** = column of the seating group
* **arr[2]** = the distance of the seating group from front/center.

**int: getManhattanDistance(row, column)**
Returns distance of a seat from the front and center of the seating area.

### reservationType Enum
Both the seatingChart class and the driver program make use of an enum to define some reservation states for seats:
* reservationType.INVALID = undefined (the seat does not exist).
* reservationType.NONE: 0 (the seat is free).
* reservationType.STANDARD: 1 (the seat is reserved).
* reservationType.VIP: 2 (the seat has a special 'VIP' reservation).

## Driver Program:
The driver[.js] program encapsulates a number of functions which make use of the seatingChart class mentioned above.

``var mySeatingArea = new seatingDriver(3, 11, 10, "log", "seating");``
Creates a seating area with 3 rows, 11 columns, a max of 10 seats per group, and output from the program will be printed to the HTML DOM elements #log (log messages) and #seating (a visual seating chart).

### Driver Program Properties
* **.maxtickets:** The max number of seats/tickets a group can reserve together.
* **.regex:** A regular expression to match seats entered in R1C1 (row 1, column 1) or R1C2N3 (row 1, column 2, group of 3) format.
* **.seating:** The seating chart created from the seating class.
* **.loggingID:** The HTML element ID to print log messages to.
* **.layoutID:** The HTML element ID to insert a seating chart into.

### Driver Program Methods
**none: onUserInput(input)**
Text input from the user to be processed for seating.  Can contain R1C1 or R1C1N2 format on the first line.  Any lines with just a number will start a search and reservation for that many seats in the best location possible.

**none: reserveInitialSeats(text)**
Parses a line of text for commands in R1C1 or R1C1N2 format.  Seats specified in this format will be reserved with VIP status.

**bool: reserveSeatGroup(seats)**
Searches for the number of seats specified by *seats*.  The best position found will be reserved with Stardard status.

**none: logToPage(any, ..)**
Accepts any number of parameters, concatenates them, and prints them to browser console, and (if found) the HTML element specified by *.loggingID*.

**bool: renderHTMLTable()**
Renders a seating chart as an HTML table and outputs it into the HTML element specified by *.layoutID*.  Returns true on success or false if the layoutID is invalid.
