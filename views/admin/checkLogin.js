$(document).ready(function () {
    function checkLogin() {
        $.ajax({
            type: "GET",
            url: "/loginStatus",
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) { 
                console.log(data);
                document.getElementById('username').innerHTML = data.user;
                var login = document.getElementById('loginTab');
                var logout = document.getElementById('logoutTab');
                if (login != null)
                    login.style.display = "none";
                if (logout != null)
                    logout.style.display = "block";
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.warn(XMLHttpRequest.responseText);
                window.location.href = '/admin/RestrictedAccess.html';
            }
        })
    }
     
    function logout() {
        console.log("logout initiated")
        $.ajax({
            type: "GET",
            url: "/logout",
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
              window.location.href = '/';
              console.log(data);
              document.getElementById('logoutTab').style.display = "none";
              document.getElementById('loginTab').style.display = "block";
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.warn(XMLHttpRequest.responseText);
            }
        })
    }

    checkLogin();

});