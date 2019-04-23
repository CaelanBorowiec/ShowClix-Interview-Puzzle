var puppetShow = new seatingChart(3, 11); //Create a seating group of 3 rows and 11 columns
var input = "R1C4 R1C6 R2C3 R2C7 R3C9 R3C10\n3\n3\n3\n1\n10"; // Todo replace placeholder with actual user input method
var lines = input.split('\n');
var regex = /[Rr](\d)[Cc](\d*)/;
for(var i = 0;i < lines.length;i++)
{
  if (i === 0)
  {
    //Set up initial reservations
    var groups = lines[i].split(' ');
    for (var group = 0; group < groups.length; group++)
    {
      console.log(groups[group]);
      var match = regex.exec(groups[group]);
      console.log("Row", match[1], "Column", match[2]);
    }
  }
  else
    console.log(lines[i]);
}
