$(document).ready(function () {
  function main() {
    var db = new Kinto();
    var tasks = db.collection("Task");

    $("form").on("submit", function (event) {
      event.preventDefault();
      tasks.create({
        title: event.target.title.value,
        done: false
      })
        .then(function (res) {
          event.target.title.value = "";
          event.target.title.focus();
        })
        .catch(function (err) {
          console.error(err);
        });
    });
  }

  window.addEventListener("DOMContentLoaded", main);

});
