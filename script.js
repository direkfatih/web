$(document).ready(function () {
  // Başlangıçta boş bir sepet dizisi tanımlıyoruz.
  var cart = [];

  // Hazır API'dan aldığımız users bilgileriyle, kimlik doğrulama yapıyoruz, kimlik doğru olduğunda geçici olarak bilet alıyoruz ve siteyi görüp, kullanabiliyoruz.
  // Giriş bilgilerimiz yanlış olduğunda ise sistem bize bir alert göndererek uyarıyor.
  $("#loginForm").submit(function (e) {
    e.preventDefault();

    var username = $("#username").val();
    var password = $("#password").val();
    fetch("https://dummyjson.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          // Login başarılı
          $("#loginModal").hide();
          $("#navbar").show();
          $("#content").show();
        } else {
          alert("Hatalı kullanıcı girişi yaptınız!");
        }
      });
  });

  // API'da bulunan ürünleri fetch kullanarak sitemize çekiyoruz, daha sonrasın bu ürünleri görünlemek için cart tasarımlarını yapıp, html tarafında bulunması gereken yere .html komutla gönderiyoruz.
  fetch("https://dummyjson.com/products")
    .then((res) => res.json())
    .then((data) => {
      var productsHTML = "";
      data.products.forEach((product) => {
        productsHTML += `
          <div class="bg-white p-4 rounded border">
              <img src="${product.thumbnail}" alt="${product.title}" class="mb-2" style="height: 300px; width: auto; display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;"/>
              <h3 class="text-xl mb-2 text-center">${product.title}</h3>
              <p class="text-green-500 text-lg mb-4 text-center">${product.price}₺</p>
              <p class="text-gray-700 mb-2 text-center">${product.description}</p>
              <input type="number" min="1" value="1" class="quantityInput mb-2 p-2 ml-20 border rounded" data-id="${product.id}"/>
              <button class="addToCartBtn p-2 bg-blue-500 text-white rounded" data-id="${product.id}">Sepete Ekle</button>
          </div>
          
          `;
      });
      $("#productsListing").html(productsHTML);
    });

  //Update Cart Badge --> Add To Cart fonksiyonelliğini dahil ettiğimizde bu arkadaşı çağırıyoruz.
  function updateCartBadge() {
    var totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    $("#cartBadge").text(totalItems);
  }

  // document.on kullanıyoruz, çünkü verdiğimiz 3 parametreyi de sırasıyla gezsin ve hata almadan istediğimiz fonksiyonelliği sağlayabilelim.
  // Sepete eklediğimizde sepet ikonunun yanında, sepette kaç ürün olduğunu gösteren sayının güncellenmesi için aşağıdaki fonksiyonu yazıyoruz.
  $(document).on("click", ".addToCartBtn", function () {
    var productId = $(this).data("id");
    var quantity = $(`.quantityInput[data-id="${productId}"]`).val();
    var productTitle = $(this).closest(".bg-white").find("h3").text();
    var productPrice = parseFloat(
      $(this).closest(".bg-white").find(".text-green-500").text()
    );

    var existingProduct = cart.find((item) => item.id === productId);
    if (existingProduct) {
      existingProduct.quantity += parseInt(quantity);
    } else {
      cart.push({
        id: productId,
        title: productTitle,
        price: productPrice,
        quantity: parseInt(quantity),
      });
    }

    updateCartBadge();
  });

  // Sepete eklediğimiz ürünlerin sepet içerisinde gözükmesi için cartHtml dizimize ekliyoruz. Sepet iconumuzun yanında olan sayıyı, sepet içerisindeki ürün sayısına göre güncelliyoruz.
  function updateCartSidebar() {
    var cartHTML = "";
    var totalPrice = 0;

    cart.forEach((item) => {
      var itemTotalPrice = parseFloat(item.price) * parseInt(item.quantity);
      totalPrice += itemTotalPrice;
      cartHTML += `
      <div class="row">
      <div class="col-5"><img src="${item.thumbnail}" alt="${item.title}" style="height: auto; width: auto; object-fit: contain;"/></div>
        <div class="bg-white p-4 rounded border mb-4 text-right col-7">
          <h3 class="text-xl mb-2 text-center">${item.title}</h3>
          <p class="text-gray-700 mb-2 text-center">Quantity: ${item.quantity}</p>
          <p class="text-green-500 text-lg mb-4 text-center">Toplam: ${itemTotalPrice}₺</p>
        </div>
        <button class="btn btn-danger btn-remove-from-cart mb-5" data-id="${item.id}">Sepetten Kaldır</button>
        </div>
        `;
    });
    cartHTML += `
      <p class="text-xl text-center">Toplam Fiyat: ${totalPrice} ₺</p>`;
    $("#cartSideBar").html(cartHTML);
    $(document).on("click", ".btn-remove-from-cart", function () {
      const silinecekId = $(this).data("id");
      cartDelete(silinecekId);
      productsHTML();
    });
  }

  //show/hide cart sidebar
  $("#cartBtn").click(function () {
    $("#cartSidebar").toggleClass("translate-x-full");
    updateCartSidebar();
  });

  // Sepet İçerisindeki, Siparişi tamamla butonuna basılınca çıkacak olan alert.
  $(document).ready(function () {
    $("#siparis").on("click", function () {
      if(cart.length > 0){
        alert("Siparişiniz alınmıştır.");
      }else{
        alert("Sepetinizde ürün bulunmamaktadır.")
      }
      
    });
  });

  // Sepetten ürün silmek için aşağıdaki fonksiyonu uyguluyoruz ve sepet sayımızı güncelliyoruz.
  function cartDelete(silinecekId) {
    const indexNo = cart.findIndex((product) => product.id === silinecekId);
    if (indexNo !== -1) {
      cart.splice(indexNo, 1);
      updateCartBadge();
    }
  }

  // Sepeti temizleyen bir işlev oluşturun
  function clearCart() {
    cart = []; // Sepet dizisini boşaltın
    $("#cartSideBar").empty(); // Sepet içeriğini temizleyin
  }

  // Sepeti temizle düğmesine tıklanınca sepeti temizleyin
  $("#clearCart").on("click", function () {
    if (confirm("Sepeti temizlemek istediğinizden emin misiniz?")) {
      clearCart();
      alert("Sepet temizlendi.");
    }
    updateCartBadge();
  });
});
