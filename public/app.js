function createCard(data) {
  var card =
    "<div class='card-panel red'><div class='card-content white-text'><span class='card-title'>" +
    data.title +
    "</span><a target='_blank' href=" +
    data.link +
    ">Go To Article!!</a></div><div class='card-action'><a href='#' class='addfave'>Save To Favorites</a></div></div>";
  $("#articles").append(card);
}

$("#scraper-button").on("click", function() {
  console.log("pressed da button");
  $("#articles").empty();
  $.getJSON("/scrape", function(data) {
    console.log("in Da request");
    console.log(data);
    // Add the title and delete button to the #results section
    for (let i = 0; i < data.length; i++) {
      createCard(data[i]);
    }
  });
});

$(document).on("click", ".addfave", function() {
  console.log("button clicked");
  //console.log($(this).parent().parent().find("span").text())
  $.ajax({
    type: "POST",
    url: "/save",
    dataType: "json",
    data: {
      title: $(this)
        .parent()
        .parent()
        .find("span")
        .text(),
      link: $(this)
        .parent()
        .parent()
        .find("p")
        .text(),
      created: Date.now()
    }
  }).then(function(data) {
    console.log(data);
    getFaves();
    // $("#author").val("");
    // $("#title").val("");
  });
  return false;
});

function getFaves() {
  $.getJSON("/find", function(data) {
    console.log("in Da Find");
    console.log(data);
    $("#faves").empty();
    // Add the title and delete button to the #results section
    for (let i = 0; i < data.length; i++) {
      createFaveCard(data[i]);
    }
  });
}
function createFaveCard(data) {
  var card =
    "<div class='card-panel red'><div class='card-content white-text'><span class='card-title'>" +
    data.title +
    "</span><a target='_blank' href=" +
    data.link +
    ">Go To Article</a></div><div class='card-action'><a href='#' class='addnotes' data-id=" +
    data._id +
    ">Add Notes</a><a href='#Saved Articles' class='deletefave' data-id=" +
    data._id +
    ">Remove</a></div></div>";
  $("#faves").append(card);
}

$(document).on("click", ".addnotes", function() {
  console.log("button");
  $(".modal").modal("open");
  id = $(this).data("id");
  $("#Mheader").text(
    $(this)
      .parent()
      .parent()
      .find("span")
      .text()
  );
  $("#Mtext").append(
    $(this)
      .parent()
      .parent()
      .find("a")
      .first()
  );
  $("#addNote").attr("data-id", id);
  console.log(id);
  $.getJSON("/find/" + id, function(data) {
    console.log("in Da Find");
    console.log(data);
    $("#savedNotes").empty();
    // Add the title and delete button to the #results section
    for (let i = 0; i < data.length; i++) {
      console.log(data);
      $("#savedNotes").append(
        "<li data-id='" +
          data[i]._id +
          "' class='collection-item'>" +
          data[i].note +
          "<a id='deleteNote' class='btn-floating btn-small waves-effect waves-light red right deleteNote'><i class='material-icons'>delete_forever</i></a></li>"
      );
    }
  });
});

$(document).on("click", "#addNote", function() {
  console.log("Add Note button");
  id = $(this).data("id");

  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/addNote",
    data: {
      articleid: id,
      note: $("#note").val(),
      created: Date.now()
    }
  })
    // If that API call succeeds, add the title and a delete button for the note to the page
    .then(function(data) {
      $("#savedNotes").append(
        "<li data-id=" +
          data._id +
          " class='collection-item'>" +
          data.note +
          "<a id='deleteNote' class='btn-floating btn-small waves-effect waves-light red right deleteNote'><i class='material-icons'>delete_forever</i></a></li>"
      );
      $("#note").val("");
    });
});

$(document).on("click", ".deleteNote", function() {
  // Save the p tag that encloses the button
  var selected = $(this).parent();
  console.log(selected.attr("data-id"));
  // Make an AJAX GET request to delete the specific note
  // this uses the data-id of the p-tag, which is linked to the specific note
  $.ajax({
    type: "GET",
    url: "/delete/note/" + selected.attr("data-id"),

    // On successful call
    success: function(response) {
      // Remove the p-tag from the DOM
      selected.remove();
      // Clear the note and title inputs
      $("#note").val("");
      // Make sure the #action-button is submit (in case it's update)
      // $("#action-button").html("<button id='make-new'>Submit</button>");
    }
  });
});

$(document).on("click", ".deletefave", function() {
  // Save the p tag that encloses the button
  var selected = $(this);
  console.log(selected.attr("data-id"));
  // Make an AJAX GET request to delete the specific note
  // this uses the data-id of the p-tag, which is linked to the specific note
  $.ajax({
    type: "GET",
    url: "/delete/fave/" + selected.attr("data-id"),
    success: function(response) {
      selected
        .parent()
        .parent()
        .remove();
    }
  });
});
