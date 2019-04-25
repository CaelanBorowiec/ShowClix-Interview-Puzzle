
# ShowClix Interview Puzzle (Seating Application)

**Background:**  Your younger sister is putting on a puppet show in your family's back yard. She has left you in charge of ticketing the big event. She has informed you that she wants assigned seating. She plans on setting up 33 seats; 3 rows with 11 seats each. She already has several seats reserved for her parents and best friends. Being a good computer scientist, you decide to whip up a quick program to help her out.
Visit [https://www.showclix.com/static/puzzle.html](https://www.showclix.com/static/puzzle.html) for more details.

## Seating Chart Class:
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
