(function($) {
  "use strict"; 

  window.t = window.initAjaxProduct = {
      atTimeout: null,
      isSidebarAjaxClick: false,
      go: function() {

        this.checkItemsInMiniCart();
        this.goMiniCart();//add cart
        this.goAddToCart();
        this.goProductWishlist();
        this.goWishlistRemove();
      },
    
      goMiniCart: function() {

        //remove trong minicart
        $("#mini-cart .btn-remove").click(function(n) {
          n.preventDefault();
          var cart = $(this).parents(".mini_cart_item").attr("id");
          cart = cart.match(/\d+/g);
          Shopify.removeItem(cart, function(e) {
            t.doUpdateMiniCart(e);
          })
        });

      },


      doUpdateMiniCart: function(n) {

        $("#cart-count").text(n.item_count);
        $(".info-cart .number-cart-total.cart-count").text(n.item_count);

        $("#mini-cart .total-cart .price").html(Shopify.formatMoney(n.total_price, window.money_format));

        $("#mini-cart .shop-cart-list .info-list-cart").html("");

        //TEST
        var carttemplate = $("#jvMiniCart");
        var wrapper = jQuery('#mini-cart .shop-cart-list .info-list-cart'),
        template_compiled = Handlebars.compile(carttemplate.html());
        
        var data = this.fetchMinicartTemplateLayout(n);


        jQuery(wrapper).append(template_compiled(data));
        
        $("#mini-cart .btn-remove").click(function(n) {
            n.preventDefault();
            var cart = $(this).parents(".mini_cart_item").attr("id");
            cart = cart.match(/\d+/g);
            Shopify.removeItem(cart , function(e) {
              t.doUpdateMiniCart(e);
            })
          });
        
        if (t.checkNeedToConvertCurrency()) {
            Currency.convertAll(window.shop_currency, jQuery('[name=currencies]').val());
          }

         t.checkItemsInMiniCart();


      },


      fetchMinicartTemplateLayout: function(cart){
      // Handlebars.js cart layout
      var items = [],
          item = {},
          data = {};

     
      // Add each item to our handlebars.js data
      $.each(cart.items, function(index, cartItem) {

        var itemAdd = cartItem.quantity + 1,
            itemMinus = cartItem.quantity - 1,
            itemQty = cartItem.quantity + ' x';

        /* Hack to get product image thumbnail
         *   - Remove file extension, add _small, and re-add extension
         *   - Create server relative link
        */
        var prodImg = cartItem.image.replace(/(\.[^.]*)$/, "_small$1").replace('http:', '');
        var prodName = cartItem.title.replace(/(\-[^-]*)$/, "");
        var prodVariation = cartItem.title.replace(/^[^\-]*/, "").replace(/-/, "");

        // Create item's data object and add to 'items' array
        item = {
          id: cartItem.variant_id,
          title: cartItem.title,
          line: index + 1, // Shopify uses a 1+ index in the API
          url: cartItem.url,
          image: prodImg,
          name: prodName,
          variation: prodVariation,
          itemAdd: itemAdd,
          itemMinus: itemMinus,
          quantity: cartItem.quantity,
          price: Shopify.formatMoney(cartItem.price, window.money_format)
        };

        items.push(item);
      });

      // Gather all cart data and add to DOM
      data = {
        items: items,
        totalPrice: Shopify.formatMoney(cart.total_price, window.money_format)
        
      }
      return data;
    },

    checkNeedToConvertCurrency: function() {
        return (jQuery('[name=currencies]') .length > 0) && window.show_multiple_currencies && Currency.currentCurrency != shopCurrency;
    },


    checkItemsInMiniCart: function() {

        
        if ($("#mini-cart .shop-cart-list .info-list-cart").children().length > 0) {
          $("#mini-cart").removeClass('mini_cart_hidden');
          $("#mini-cart").parent().removeClass('hidden');
          
        } 
        else {
          $("#mini-cart").addClass('mini_cart_hidden');
          $("#mini-cart").parent().addClass('hidden');
        }
    },

    goAddToCart: function() {
        if ($(".product-add-cart.btn-ajax").length > 0) {
          $(".product-add-cart.btn-ajax").click(function(n) {
            
            n.preventDefault();
           

            if ($(this).attr("disabled") != "disabled") {
              var cart = $(this).parents(".item-product");
              
              var form = $(this).parents('form');
                
                if (!window.ajax_cart) {
                  form.submit();
                } 
                else {
                  var s = form.find("select[name=id]").val();
                  if (!s) {
                    s = form.find("input[name=id]").val();
                  }
                  var o = form.find("input[name=quantity]").val();
                  if (!o) {
                    o = 1
                  }
                  var u = $(cart).find(".product-title").text();
                  t.doAjaxAddToCart(s, o, u)
                }

            }
            return false;
          })
        }
    },

    doAjaxAddToCart: function(n, r, i, s) {
        $.ajax({
          type: "post",
          url: "/cart/add.js",
          data: "quantity=" + r + "&id=" + n,
          dataType: "json",
          beforeSend: function() {
            t.showLoading()
          },
          success: function(n) {
             
            t.hideLoading();
            $(".ajax-success-cbox").find(".ajax-product-title").text(i);
            $(".ajax-success-cbox").find(".show-wishlist").hide();
            $(".ajax-success-cbox").find(".show-cart").show();
            t.showBox(".ajax-success-cbox");
            t.updateMiniCart();
          },
          error: function(n, r) {
            t.hideLoading();
            $(".ajax-error-message").text($.parseJSON(n.responseText).description);
            t.showBox(".ajax-error-cbox")
          }
        })
    },
      
    showLoading: function() {
        $("body").addClass('ajaxing');
      },

    hideLoading: function() {
        $("body").removeClass('ajaxing');
    },

    showBox: function(n) {
        $(n).addClass('slideInUp');
        t.atTimeout = setTimeout(function() {
          $(n).removeClass('slideInUp');
        }, 5e3)
    },

    updateMiniCart: function() {
        Shopify.getCart(function(e) {
          t.doUpdateMiniCart(e);
        })
    },

    goProductWishlist: function() {
        
      $("button.action.product-wishlist").click(function(n) {
        n.preventDefault();
          var r = $(this).parent();
          // var i = r.parents(".grid-item");
          $.ajax({
            type: "POST",
            url: "/contact",
            data: r.serialize(),
            beforeSend: function() {
              t.showLoading();
            },
            success: function(n) {
              t.hideLoading();
              r.html('<a class="action product-wishlist wishlist-added wishlist" href="/pages/wishlist" data-toggle="tooltip" data-placement="bottom" title="Go to wishlist"><span class="fa fa-heart"></span></a>');
              $(".ajax-success-cbox").find(".show-wishlist").show();
              $(".ajax-success-cbox").find(".show-cart").hide();
              t.showBox(".ajax-success-cbox");
            },
            error: function(n, r) {
              t.hideLoading();
              $("body").removeClass('ajaxing');
              $(".ajax-error-message").text($.parseJSON(n.responseText).description);
              t.showBox(".ajax-error-cbox");
            }
          })
        })
    },

    goWishlistRemove: function(){
        $('.btn-remove-wishlist').click(function() {
          var value = $(this).attr('data');
          $('.remove-value').val(value);
          $('.contact-form').submit();
        });
    }

  };


  var jvbigC = {

    btnLoadMore : function(){

        //Product Load More
      $('.list-product-loadmore').each(function() {
          var size_li = $(this).find(".product-grid-item").size();
          var x = $(this).find('.btn-link-loadmore').attr('data-num');
          var y = parseInt($(this).find('.btn-link-loadmore').attr('data-num')) - 1;
          $(this).find('.product-grid-item:lt(' + x + ')').show();
          $(this).find('.product-grid-item:gt(' + y + ')').hide();
          $(this).find('.btn-link-loadmore').click(function() {
              var size_li = $(this).prev().find("li").size();
              var x = $(this).attr('data-num');
              var x = parseInt($(this).attr('data-num'));
              $(this).attr('data-num', x + 4);
              var x = $(this).attr('data-num');
              $(this).prev().find('.product-grid-item:lt(' + x + ')').show();
              if ($(this).attr('data-num') > size_li) {
                  $(this).hide();
              }
          });
      });
    },

    goTestimonialLeftRight : function(){
      //Testimonial
        if ($(window).width() >= 768) {
            $('.left-open').on('click', function(event) {
                event.preventDefault();
                $(this).parents('.item').removeClass('right-open');
                $(this).parents('.item').removeClass('left-close');
                $(this).parents('.item').addClass('left-open');
            })
            $('.left-close').on('click', function(event) {
                event.preventDefault();
                $(this).parents('.item').removeClass('left-open');
                $(this).parents('.item').addClass('left-close');
            })
            $('.right-open').on('click', function(event) {
                event.preventDefault();
                $(this).parents('.item').removeClass('left-open');
                $(this).parents('.item').removeClass('right-close');
                $(this).parents('.item').addClass('right-open');
            })
            $('.right-close').on('click', function(event) {
                event.preventDefault();
                $(this).parents('.item').removeClass('right-open');
                $(this).parents('.item').addClass('right-close');
            })
        }
        //End
    },

    goCollectionFilter: function(){
              
      $('body').click(function() {
          $('.box-attr-filter').slideUp();
      });

      $('.btn-filter').click(function(event) {
          event.preventDefault();
          event.stopPropagation();
          $(this).parent().next('.box-attr-filter').slideToggle();
          // $('.box-attr-filter').slideToggle();
      });
    },

    goHomeBoxExtraSub: function(){
      $('.icon-extra-sub').click(function(event) {
        event.preventDefault();
        $('.icon-extra-sub').addClass('hide-box')
        $(this).next().addClass('show-box');
      });

      $('.close-extra-sub').click(function(event) {
        event.preventDefault();
        $('.icon-extra-sub').removeClass('hide-box')
        $(this).parent().removeClass('show-box');
      });

    },

    goCategoryLightbox: function(){
      //Category Lightbox
      $('.header-banner-link').click(function(event) {
            event.preventDefault();
            $(this).parent().next().addClass('height-light');
      });

      $('.close-category-lightbox').click(function(event) {
            event.preventDefault();
            $(this).parent().removeClass('height-light');
      });
    },

    goAttachToSliderBx: function(){
      //Slider Scroll
      if ($('.item-product-featured').length > 0) {
          $('.item-product-featured').each(function() {
              $(this).find('.bxslider').bxSlider({
                  pagerCustom: '.bx-pager',
                  nextText: '',
                  prevText: ''
              });
          });
      }

            //Banner Tab Slider
      if ($('.slider-tab').length > 0) {
          $('.slider-tab .bxslider').bxSlider({
              pagerCustom: '.slider-tab #bx-pager',
              nextText: '',
              prevText: ''
          });
      }
      //Product Gallery
      if ($('.has-sidebar .product-gallery .bxslider').length > 0) {

           $('.has-sidebar .product-gallery:not(.no-zoom) #bx-pager').bxSlider({
              slideWidth: 120,
              minSlides: 4,
              maxSlides: 4,
              slideMargin: 6,
              infiniteLoop: false,
              nextText: '<span class="lnr lnr-chevron-right"></span>',
              prevText: '<span class="lnr lnr-chevron-left"></span>'
            });
      }

      if ($('.none-sidebar .product-gallery .bxslider').length > 0) {

           $('.none-sidebar .product-gallery:not(.no-zoom) #bx-pager').bxSlider({
              slideWidth: 126,

              slideMargin: 0,
              mode: 'vertical',
              infiniteLoop: false,
              nextText: '<span class="lnr lnr-chevron-up"></span>',
              prevText: '<span class="lnr lnr-chevron-down"></span>'
            });
       }

       if($('.product-gallery.no-zoom .bxslider').length > 0){
        $('.product-gallery.no-zoom .bxslider').bxSlider({
          pagerCustom: '.product-gallery #bx-pager',
           maxSlides: 4,
           infiniteLoop: false,
          nextText:'<span class="lnr lnr-chevron-right"></span>',
          prevText:'<span class="lnr lnr-chevron-left"></span>'
        });
      }

        //Post Gallery
      if ($('.post-format-gallery .bxslider').length > 0) {
          $('.post-format-gallery .bxslider').bxSlider({
              pagerCustom: '.post-format-gallery #bx-pager',
              nextText: '<span class="lnr lnr-arrow-right-circle"></span>',
              prevText: '<span class="lnr lnr-arrow-left-circle"></span>'
          });
      }

    },

    goAttachToSliderOwl: function(){
      //Category Slider
      if ($('.category-slider').length > 0) {
            $('.category-slider').each(function() {

                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 2],
                        [768, 3],
                        [992, 3],
                        [1200, 4]
                    ],
                    pagination: false,
                    lazyLoad : true,
                    navigation: true
                });

            });
        }
        //Post Slider
        if ($('.post-slider').length > 0) {
            $('.post-slider').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 2],
                        [768, 2],
                        [992, 2],
                        [1200, 2]
                    ],
                    pagination: false,
                    lazyLoad : true,
                    navigation: true,
                    navigationText: ['<i class="fa fa-caret-left"></i>', '<i class="fa fa-caret-right"></i>']
                });
            });
        }

           //Post Slider
        if ($('.slider-owl-2-items').length > 0) {
            $('.slider-owl-2-items').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 2,
                    itemsCustom: [
                        [0, 1],
                        [480, 2],
                        [768, 2],
                        [992, 2],
                        [1200, 2]
                    ],
                    pagination: false,
                    lazyLoad : true,
                    navigation: true,
                    navigationText: ['<i class="fa fa-caret-left"></i>', '<i class="fa fa-caret-right"></i>']
                });
            });
        }

        //Customer Slider
        if ($('.customer-saying').length > 0) {
            $('.customer-saying').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 2],
                        [768, 2],
                        [992, 3],
                        [1200, 3]
                    ],
                    pagination: false,
                    lazyLoad : true,
                    navigation: false,
                    autoPlay: true
                });
            });
        }

        //Product Slider --> single -> related product

        if ($('.slider-owl-1-item-nav').length > 0) {
            //.none-sidebar .product-slider
            //.has-sidebar .product-slider
             $('.slider-owl-1-item-nav').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 2],
                        [768, 3],
                        [992, 3],
                        [1200, 4]
                    ],
                    pagination: false,
                    lazyLoad : true,
                    navigation: true
                });
            });
        }

       if ($('.slider-owl-1-item-nav.arrow-style').length > 0) {
            // .product-slider.slider-owl-1-item-nav
            //.post-gallery/ == page Post Slider
            $('.slider-owl-1-item-nav.arrow-style').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 2],
                        [768, 3],
                        [992, 3],
                        [1200, 4]
                    ],
                    pagination: false,
                    lazyLoad : true,
                    navigation: true,
                    navigationText: ['<span class="lnr lnr-arrow-left-circle"></span>', '<span class="lnr lnr-arrow-right-circle"></span>']
                });
            });
        }

        //Partner Slider
        if ($('.partner-slider-paginav').length > 0) {
            $('.partner-slider-paginav').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 2],
                        [480, 3],
                        [768, 4],
                        [992, 5],
                        [1200, 6]
                    ],
                    pagination: true,
                    lazyLoad : true,
                    navigation: false,
                    autoPlay: true,
                });
            });
        }
        if ($('.partner-slider-paginav-buttonnav').length > 0) {
            $('.partner-slider-paginav-buttonnav').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 2],
                        [480, 3],
                        [768, 4],
                        [992, 5],
                        [1200, 6]
                    ],
                    pagination: true,
                    lazyLoad : true,
                    navigation: true,
                    navigationText: ['<span class="lnr lnr-arrow-left-circle"></span>', '<span class="lnr lnr-arrow-right-circle"></span>']
                });
            });
        }
        if ($('.partner-slider-directnav').length > 0) {
            $('.partner-slider-directnav').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 2],
                        [480, 3],
                        [768, 4],
                        [992, 5],
                        [1200, 6]
                    ],
                    pagination: false,
                    lazyLoad : true,
                    navigation: true,
                    navigationText: ['<span class="lnr lnr-arrow-left-circle"></span>', '<span class="lnr lnr-arrow-right-circle"></span>']
                });
            });
        }

        //home-testimonial-slider
        //home-latest-news .default-directnav
        //default-directnav
        if ($('.slider-owl-single-item-nav').length > 0) {
            $('.slider-owl-single-item-nav').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    singleItem: true,
                    pagination: false,
                    lazyLoad : true,
                    navigation: true,
                    navigationText: ['<span class="lnr lnr-arrow-left-circle"></span>', '<span class="lnr lnr-arrow-right-circle"></span>']
                });
            });
        }

        //.testimonial-slider
        //.the-brand
        if ($('.slider-owl-single-item-paging-fade').length > 0) {
            $('.slider-owl-single-item-paging-fade').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    singleItem: true,
                    transitionStyle: "fade",
                    pagination: true,
                    lazyLoad : true,
                    navigation: false
                });
            });
        }

        //.banner-slider-circle-hoztical
        //.banner-slider-circle-vertical
        //.banner-slider-rect-vertical
        //.popular-post-masonry
        //.header-slider == slider 1
        if ($('.slider-owl-single-item-paging').length > 0) {
            $('.slider-owl-single-item-paging').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    singleItem: true,
                    pagination: true,
                    lazyLoad : true,
                    navigation: false,
                });
            });
        }


        //.banner-slider
        //product-tab-slider home 6
        //new-product
        if ($('.slider-owl-single-item-nav-chevron').length > 0) {
            $('.slider-owl-single-item-nav-chevron').each(function() {

                //TODO
                // container.find('.item').each(function() {
                //     var ev = $(this).find('.slide-video').first();
                //     ev.length && ev.get(0).play();
                // });

                $(this).find('.wrap-item').owlCarousel({
                    singleItem: true,
                    pagination: false,
                    navigation: true,
                    lazyLoad : true,
                    autoPlay: false,
                    navigationText: ['<span class="lnr lnr-chevron-left"></span>', '<span class="lnr lnr-chevron-right"></span>']
                });
            });
        }

                //Popular Post
        if ($('.slider-owl-4-items').length > 0) {
            $('.slider-owl-4-items').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 4,
                    itemsCustom: [
                        [0, 1],
                        [480, 1],
                        [768, 1],
                        [992, 1],
                        [1200, 4]
                    ],
                    lazyLoad : true,
                    pagination: true,
                    navigation: false,
                });
            });
        }


        //Home Featured Slider
        if ($('.home-featured-slider').length > 0) {
            $('.home-featured-slider').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 1],
                        [768, 1],
                        [992, 1],
                        [1200, 1]
                    ],
                    addClassActive: true,
                    lazyLoad : true,
                    pagination: true,
                    navigation: true,
                    navigationText: ['<span class="lnr lnr-arrow-left-circle"></span>', '<span class="lnr lnr-arrow-right-circle"></span>']
                });
            });
            var first = $('.home-featured-slider .owl-theme .owl-controls .owl-page').first().index() + 1;
            var last = $('.home-featured-slider .owl-theme .owl-controls .owl-page').last().index() + 1;
            $('.control-paginav-featured-slider').prepend('<span class="first-num">' + first + '</span>');
            $('.control-paginav-featured-slider').append('<span class="last-num">' + last + '</span>');
            //Range with fixed maximum
            $(".control-paginav-featured-slider #slider-range-max").slider({
                range: "max",
                min: first,
                max: last,
                value: first,
                slide: function(event, ui) {
                    $(".control-paginav-featured-slider #amount").text(ui.value);
                    $('.home-featured-slider').find('.wrap-item').trigger('owl.goTo', ui.value);
                }
            });
            $(".control-paginav-featured-slider #amount").text($(".control-paginav-featured-slider #slider-range-max").slider("value"));
            $(".control-paginav-featured-slider #amount").appendTo($(".control-paginav-featured-slider .ui-slider-handle.ui-state-default.ui-corner-all"));
        }

    },

    goMenuMobile: function(){
      //Menu Responsive
      if ($(window).width() < 1025) {
          // $('body').not('.menu-dropdown >a').click(function(e) {
          //     console.log(e.target);
          //     e.stopPropagation();
          //     $('.main-menu').removeClass('active');
          //     $('.mainmenu .dropdownMenu').removeClass('active');

          //     $('.show-menu').toggle();
          //     $('.hide-menu').toggle();
          // });
          $('.show-menu').click(function(event) {
              event.preventDefault();
              event.stopPropagation();
              $(this).hide();
              $(this).next().show();
              $('.main-menu').addClass('active');
              $('.mainmenu .dropdownMenu').addClass('active');
          });
          $('.hide-menu').click(function(event) {
              event.preventDefault();
              event.stopPropagation();
              $(this).hide();
              $(this).prev().show();
              $('.main-menu').removeClass('active');
              $('.mainmenu .dropdownMenu').removeClass('active');
          });
          

          $('.mainmenu .dropdownMenu li.menu-item-has-children > a').click(function(event) 
          {
              event.stopPropagation();
              event.preventDefault();

              $(this).toggleClass('active');
              if ($(this).hasClass('active')) {
                  event.preventDefault();
                  $('.sub-menu').fadeOut(400);
                  $(this).next().stop(true, true).fadeIn(400);
              } else {
                  $('.sub-menu').fadeOut(400);
                  $(this).next().stop(true, true).fadeOut(400);
              }
          });

          $('.mega-menu-content .mega-menu-item-has-children').click(function(e){
             $(this).toggleClass('active');

              if ($(this).hasClass('active')) {

                  event.preventDefault();
                  $(this).find('.sub-menu').fadeOut(400);
                  // $(this).next().stop(true, true).fadeIn(400);
              } else {
                  $(this).find('.sub-menu').fadeOut(400);
                  // $(this).next().stop(true, true).fadeOut(400);
              }

          });
      }
    
    },


    goMenuMobileOSS: function(){

       if ($(window).width() < 768) {
          var $nav_MainMenu = $(".mainmenu");

           $nav_MainMenu.each(function () {

          $(this).find(">li li:has(ul)").children("a").on('click', function (event) {
                  event.preventDefault();
          });
          

          $(this).find(".menu-dropdown > a").each(function () {
                  $(this).siblings('ul').hide();
                  $(this).on("click", function (event) {
                      event.preventDefault();
                      event.stopPropagation();
                      jvbigC.menu_DropdownTrigger(this);
                  });
              });

          });
  
       }
    },

    menu_DropdownTrigger : function (selector) {
        
        if ($(selector).hasClass('menu-trigger')) {
            $(selector).parent('li')
                .find('a')
                .removeClass('menu-trigger')
                .parent('li')
                .children('ul')
                .slideUp(400);
        }

         else {
            $(selector)
                .addClass('menu-trigger')
                .parent('li')
                .siblings()
                .find('a')
                .removeClass('menu-trigger')
                .parent('li')
                .children('ul')
                .slideUp(400);

            $(selector)
                .siblings('ul').slideDown(400);
        }
    },

    goFancyBox: function(){
      //Post Gallery
      $('.item-post-gallery .fancybox').fancybox();
      $('.item-team-gallery .fancybox').fancybox();
    },

    goSearchCategoryMenu: function(){
     //Toggle Search
      $('body').click(function() {
          $('.select-category').slideUp();
      });
      $('.toggle-category').click(function(event) {
          event.preventDefault();
          event.stopPropagation();
          $(this).next().slideToggle();
      });
    },

    goFilterPriceSidebar: function (){
      //Filter Price
      $("#slider-range").slider({
          range: true,
          min: 0,
          max: 500,
          values: [49, 419],
          slide: function(event, ui) {
              $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
          }
      });
      $("#amount").val("$" + $("#slider-range").slider("values", 0) +
          " - $" + $("#slider-range").slider("values", 1));
      //Attr Filter Price
      $("#slider-range-price").slider({
          range: true,
          min: 0,
          max: 5000,
          values: [924, 5000],
          slide: function(event, ui) {
              $("#amount-price").val("$" + ui.values[0] + " - $" + ui.values[1]);
          }
      });
      $("#amount-price").val("$" + $("#slider-range-price").slider("values", 0) + " - $" + $("#slider-range-price").slider("values", 1));
    },

    goJVCountdown: function(){
      if ($('.jv-countdown').length > 0) {

        $('.jv-countdown').each(function(){

          var id = $(this).attr('id'),
            canvascolor = $(this).data('canvascolor'),
            circlegbcolor = $(this).data('circlegbcolor'),
            ani = $(this).data('ani'),

            dateshow = $(this).data('dateshow'),
            datetext = $(this).data('datetext'),
            datecolor = $(this).data('datecolor'),

            hourshow = $(this).data('hourshow'),
            hourtext = $(this).data('hourtext'),
            hourcolor = $(this).data('hourcolor'),

            minshow = $(this).data('minshow'),
            mintext = $(this).data('mintext'),
            mincolor = $(this).data('mincolor'),

            secshow = $(this).data('secshow'),
            sectext = $(this).data('sectext'),
            seccolor = $(this).data('seccolor');

            //check date
            var var_date = new Date($(this).data('date'));

            var today_date = new Date();

            if(var_date > today_date){
              
              if($(this).parent().hasClass('countdown--small')){
                    $(this).TimeCircles({
                    animation: ani,
                    fg_width: 0.03,
                    bg_width: 0,
                    text_size: 0,
                    circle_bg_color: canvascolor,
                    time: {
                        Days: {
                            show: dateshow,
                            text: "",
                            color: datecolor
                        },
                        Hours: {
                            show: hourshow,
                            text: "",
                            color: hourcolor
                        },
                        Minutes: {
                            show: minshow,
                            text: "",
                            color: mincolor
                        },
                        Seconds: {
                            show: secshow,
                            text: "",
                            color: seccolor
                        }
                    }
                });
              }
              else
              {
                $(this).TimeCircles({
                    animation: ani,
                    fg_width: 0.03,
                    bg_width: 0,
                    text_size: 0,
                    circle_bg_color: canvascolor,
                    time: {
                        Days: {
                            show: dateshow,
                            text: datetext,
                            color: datecolor
                        },
                        Hours: {
                            show: hourshow,
                            text: hourtext,
                            color: hourcolor
                        },
                        Minutes: {
                            show: minshow,
                            text: mintext,
                            color: mincolor
                        },
                        Seconds: {
                            show: secshow,
                            text: sectext,
                            color: seccolor
                        }
                    }
                });
              }
          }
         
          //update circle to have the same dimension for w and h
          $( ".time_circles div[class^='textDiv_']").each(function(){
             var w = $(this).width();
            $(this).height(w);
          });

        });
      }
    },

    goToTop: function(){

      $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
          $('#back-top').addClass('show');
        } else {
          $('#back-top').removeClass('show');
        }

        // if ($(this).scrollTop() > 50) {
        //   $('.home-box-extra').addClass('hidden-xs');
        // } else {
        //   $('.home-box-extra').removeClass('hidden-xs');
        // }


      });

      $('#back-top').click(function () {
        $('body,html').animate({
          scrollTop: 0
        }, 800);
        return false;
      });
    },

    goChangeView: function(){
      $('.collection-view .change-view').click(function(){
        var v = $(this).data('view');

        //change active class for both toolbar on top and bottom
        var clicked_ele = $('.change-view[data-view='+ v +']');
        if(clicked_ele.length){
          clicked_ele.addClass('collection-view--active');
          clicked_ele.parent().siblings().find('.change-view').removeClass('collection-view--active');
        }

        if(v == 'list'){
          $('.collection-product.product-grid').removeClass('product-grid').addClass('product-list changed-view');
          $('.collection-product .product-grid-item').removeClass('product-grid-item col-md-4 col-sm-6').addClass('product-list-item ');
        }
        else{
          $('.collection-product.product-list').removeClass('product-list').addClass('product-grid changed-view');
          $('.collection-product .product-list-item').removeClass('product-list-item').addClass('product-grid-item col-md-4 col-sm-6');
        }
      });
    }



  };
    
  $(document).ready(function() {
        
    //Button Mobile
    if ($(window).width() < 768) {
      
      

      
          //.icon-cart -> use ajaxify
          $('.language-link,.currency-link,.account-link:not(.nosub),.icon-user').click(function(event) {
              event.preventDefault();
              
              if( $('html').hasClass('supports-touch' == false) ){
                $(this).next().slideToggle();
                  console.log('slideToggle');
              }
              // $(this).next().show();
          });
        

        $('.info-search .icon-search').on('click',function(){
           event.preventDefault();
           event.stopPropagation();
           $(this).parent().toggleClass('form-visible');
           // $(this).next().slideToggle();
        });
    }

    //Fixed Latest News 
    if ($(window).width() > 768) {
        $('.item-home-latest-news').click(function() {
          $(this).toggleClass('active');
        });
    }

    //call
    window.t.go();

    jvbigC.btnLoadMore();
    jvbigC.goTestimonialLeftRight();
    jvbigC.goCollectionFilter();
    jvbigC.goHomeBoxExtraSub();
    jvbigC.goCategoryLightbox();

    jvbigC.goAttachToSliderBx();

    jvbigC.goAttachToSliderOwl();

    jvbigC.goMenuMobile();
    jvbigC.goMenuMobileOSS();

    jvbigC.goFancyBox();

    jvbigC.goSearchCategoryMenu();

    jvbigC.goFilterPriceSidebar();

    jvbigC.goChangeView();
    
    
    jvbigC.goJVCountdown();
    
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      var tabid = $(e.target).attr("href");
      
      //must rebuild countdown when changing the tabs  
      $(tabid).find('.jv-countdown').TimeCircles().rebuild();
      
      //update circle to have the same dimension for w and h
      $(tabid).find( ".time_circles div[class^='textDiv_']").each(function(){
         var w = $(this).width();
        $(this).height(w);
      });
    });

    jvbigC.goToTop();
      

  });

  //Window Load
  $(window).load(function() {
   
  });

})(jQuery); // End of use strict


jQuery(function($) {

    // ======================================================
    // callback for option_selection.js
    // ======================================================
    // The following will have to be in your product template (without the comments wrapping it!) to initialize the option_selection.js

    /*
    jQuery(function($) {

      new Shopify.OptionSelectors('product-select', { product: {{ product | json }}, onVariantSelected: selectCallback, enableHistoryState: true });
    });
    */

});