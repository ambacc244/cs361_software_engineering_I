// Do search stuff here.

function disableEmptyInputs(form) {
  console.log("disable");
  var controls = form.elements;
  for (var i=0, iLen=controls.length; i<iLen; i++) {
    controls[i].disabled = controls[i].value == '';
  }
}
