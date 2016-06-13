(function($) {
    "use strict"; 
    
    jQuery(document).ready(function() {
        
        //Select UI
        $('.orderby').selectmenu();
        
        //Button Mobile
        if ($(window).width() < 768) {
            $('.language-link,.currency-link,.account-link,.icon-search,.icon-user,.icon-cart').click(function(event) {
                event.preventDefault();
                $(this).next().slideToggle();
            });
        }

        //Fixed Latest News 
        if ($(window).width() > 768) {
            $('.item-home-latest-news').click(function() {
              $(this).toggleClass('active');
            });
        }

        var t = window.initAjaxProduct = {
            atTimeout: null,
            isSidebarAjaxClick: false,
            go: function() {

              this.goQuickview();

              this.goMiniCart();//add cart
              this.goAddToCart();
              // this.goProductAddToCart();
               // this.goWishlist();
                this.goProductWishlist();
                this.goWishlistRemove();
            },



             goQuickview: function() {
               $('.action.product-quick-view').click(function() { 
                    t.showLoading();

                    var id = $(this).attr('data-id');
                    var rating = (($(this).closest('.item-product').find('.spr-badge').attr('data-rating')) * 20)+"%";

                    Shopify.getProduct(id, function(product) {
                      console.log(product);
                      var template = $('#quick-view').html();
                      $('.quickview-product').html(template);
                      var quickview = $('.quickview-product');

                      quickview.find('.product-name a').html(product.title).attr('href', product.url);
                      quickview.find('.spr-badge .spr-active').css({"width": rating});


                      
                      if (quickview.find('.des').length > 0) { 
                        var description = product.description.replace(/(<([^>]+)>)/ig, "");        
                        description = description.split(" ").splice(0, 20).join(" ") + "...";
                        quickview.find('.des').text(description);
                      } else { 
                        quickview.find('.des').remove();
                      }
                      quickview.find('.product-category').html(product.type);
                      quickview.find('.price').html(Shopify.formatMoney(product.price, window.money_format));
                      quickview.find('.product-inner').attr('id', 'product-' + product.id);
                      quickview.find('.variants').attr('id', 'product-actions-' + product.id);
                      quickview.find('.variants select').attr('id', 'product-select-' + product.id);

                      if (product.compare_at_price > product.price) {
                        quickview.find('.compare-price').html(Shopify.formatMoney(product.compare_at_price_max, window.money_format)).show();
                        quickview.find('.price').addClass('on-sale');
                      } else {
                        quickview.find('.compare-price').html('');
                        quickview.find('.price').removeClass('on-sale');
                      }

                      //out of stock
                      if (!product.available) {
                        quickview.find("select, input, .total-price, .dec, .inc, .variants label").remove();
                        quickview.find(".btn-addToCart").text('unavailable').addClass('disabled').attr("disabled", "disabled");;
                      } else {
                        quickview.find('.total-price span').html(Shopify.formatMoney(product.price, window.money_format));   

                        //engoQuickview.createQuickViewVariantsSwatch(product, quickview);        
                      }

                      //qtyProduct();
                      // currency();
                      //engoQuickview.quickViewSlider(product, quickview);
                      //engoQuickview.initQuickviewAddToCart();


                      $('.quickview-product').addClass('active'); 
                      
                      t.hideLoading();
  

                      if ($('.quickview-product .total-price').length > 0) {
                     //   $('.quickview-product span[class=qtyplus]').on('click', engoQuickview.updatePricingQuickview);
                      //  $('.quickview-product span[class=qtyminus]').on('click', engoQuickview.updatePricingQuickview);
                      }

                      // quickview.find('.owl-carousel').owlCarousel({ 
                      //   items: quickview.find('.owl-carousel').attr('data-items'),
                      //   dots: false
                      // });


                    });

                    //currency();

                    return false;  

            });
            },

            goMiniCart: function() {

              //remove trong minicart
              $("#mini-cart .btn-remove").click(function(n) {
                n.preventDefault();
                var cart = $(this).parents(".mini_cart_item").attr("id");
                cart = cart.match(/\d+/g);
                Shopify.removeItem(cart, function(e) {
                  t.doUpdateMiniCart(e)
                })
              })

            },
            // end goMiniCart

            doUpdateMiniCart: function(n) {

              var cart = '<li class="mini_cart_item item-info-cart" id="cart-item-{ID}"><div class="cart-thumb"><a href="{URL}" title="{TITLE}" class="cart-thumb cart-image">  <img src="{IMAGE}"  alt="{TITLE}"></a></div> <div class="wrap-cart-title"><h3 class="cart-title"><a href="{URL}"> {TITLE} </a></h3><div class="product-quantity cart-qty"><span class="price">{PRICE}</span> x <span class="cart-qty--number">{QUANTITY}</span></div></div><div class="wrap-cart-remove"><a class="remove-product product-remove remove btn-remove" href="javascript:void(0)"><i class="lnr lnr-cross"></i></a><span class="cart-price"></span></div></li>';        

              $("#cart-count").text(n.item_count);
              $(".info-cart .number-cart-total.cart-count").text(n.item_count);

              $("#mini-cart .total-cart .price").html(Shopify.formatMoney(n.total_price, window.money_format));
              $("#mini-cart .shop-cart-list").html("");
              if (n.item_count > 0) {
                for (var i = 0; i < n.items.length; i++) {
                  var s = cart;
                  s = s.replace(/\{ID\}/g, n.items[i].id);
                  s = s.replace(/\{URL\}/g, n.items[i].url);
                  s = s.replace(/\{TITLE\}/g, n.items[i].title);
                  s = s.replace(/\{QUANTITY\}/g, n.items[i].quantity);
                  s = s.replace(/\{IMAGE\}/g, Shopify.resizeImage(n.items[i].image, "small"));
                  s = s.replace(/\{PRICE\}/g, Shopify.formatMoney(n.items[i].price, window.money_format));
                  $("#mini-cart .shop-cart-list").append(s)
                }
                $("#mini-cart .btn-remove").click(function(n) {
                  n.preventDefault();
                  var cart = $(this).parents(".mini_cart_item").attr("id");
                  cart = cart.match(/\d+/g);
                  Shopify.removeItem(cart , function(e) {
                    t.doUpdateMiniCart(e)
                  })
                })
              }
              t.checkItemsInMiniCart()

            } // end doUpdateMiniCart
            ,


            checkItemsInMiniCart: function() {
              if ($("#mini-cart .cart-list").children().length > 0) {
                $("#mini-cart").removeClass('mini_cart_hidden')
              } else {
                $("#mini-cart").addClass('mini_cart_hidden')
              }
            }
            // end checkItemsInMiniCart
            ,

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
                  return false
                })
              }
            }
            // end goAddToCart
            ,
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
                  t.updateMiniCart()
                },
                error: function(n, r) {
                  t.hideLoading();
                  $(".ajax-error-message").text($.parseJSON(n.responseText).description);
                  t.showBox(".ajax-error-cbox")
                }
              })
            }
            // end doAjaxAddToCart
            ,
             showLoading: function() {
              $("body").addClass('ajaxing')
            },
            hideLoading: function() {
              $("body").removeClass('ajaxing')
            },
             showBox: function(n) {
              $(n).addClass('slideInUp');
              t.atTimeout = setTimeout(function() {
                $(n).removeClass('slideInUp');
              }, 5e3)
            },
            updateMiniCart: function() {
              Shopify.getCart(function(e) {
                t.doUpdateMiniCart(e)
              })
            }
            ,
             goProductWishlist: function() {
              // $(".grid-item button.wishlist").click(function(n) {
                $("button.action.product-wishlist").click(function(n) {
                n.preventDefault();
                var r = $(this).parent();
                // var i = r.parents(".grid-item");
                $.ajax({
                  type: "POST",
                  url: "/contact",
                  data: r.serialize(),
                  beforeSend: function() {
                    t.showLoading()
                  },
                  success: function(n) {
                    t.hideLoading();
                    r.html('<a class="action product-wishlist wishlist-added wishlist" href="/pages/wishlist" data-toggle="tooltip" data-placement="bottom" title="Go to wishlist"><span class="fa fa-heart"></span></a>');
                    $(".ajax-success-cbox").find(".show-wishlist").show();
                    $(".ajax-success-cbox").find(".show-cart").hide();
                    t.showBox(".ajax-success-cbox")
                  },
                  error: function(n, r) {
                    t.hideLoading();
                    $("body").removeClass('ajaxing')
                    $(".ajax-error-message").text($.parseJSON(n.responseText).description);
                    t.showBox(".ajax-error-cbox")
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

        }
          
        t.go();



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


        //Box Filter
        $('body').click(function() {
            $('.box-attr-filter').slideUp();
        });
        $('.btn-filter').click(function(event) {
            event.preventDefault();
            event.stopPropagation();
            $('.box-attr-filter').slideToggle();
        });
        //Product Quick View
        // $('.product-quick-view').each(function() {
        //         $(this).fancybox();
        //     })
            //Control Homme Extra Box
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
        //Category Lightbox
        $('.header-banner-link').click(function(event) {
            event.preventDefault();
            $(this).parent().next().addClass('height-light');
        });
        $('.header-banner-link').click(function(event) {
            event.preventDefault();
            $(this).parent().next().addClass('height-light');
        });
        $('.close-category-lightbox').click(function(event) {
            event.preventDefault();
            $(this).parent().removeClass('height-light');
        });
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

        //Menu Responsive
        if ($(window).width() < 1025) { 
            $('body').click(function() {
                $('.main-menu').removeClass('active');
                $('.mainmenu .dropdownMenu').removeClass('active');
            });
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
            // $('.main-nav li.menu-item-has-children>a').click(function(event) 
            $('.mainmenu .dropdownMenu li.menu-item-has-children>a').click(function(event) 
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
        }

        //Post Gallery
        $('.item-post-gallery .fancybox').fancybox();
        $('.item-team-gallery .fancybox').fancybox();
        //Toggle Search
        $('body').click(function() {
            $('.select-category').slideUp();
        });
        $('.toggle-category').click(function(event) {
            event.preventDefault();
            event.stopPropagation();
            $(this).next().slideToggle();
        });
        //Change Grid-List
        $('.product-sort a').click(function(event) {
            //event.preventDefault();
            $('.product-sort a').removeClass('active');
            $(this).addClass('active');
        });

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
        $("#amount-price").val("$" + $("#slider-range-price").slider("values", 0) +
            " - $" + $("#slider-range-price").slider("values", 1));
        //Remove Product
        if ($('.remove-product-compare').length > 0) {
            $('.remove-product-compare').click(function(event) {
                event.preventDefault();
                $(this).parent().remove();
            });
        } else {
            $('.widget.widget-compare').remove();
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
            // $('.product-gallery .bxslider').bxSlider({
            //     pagerCustom: '.product-gallery #bx-pager',
            //     nextText: '<span class="lnr lnr-chevron-right"></span>',
            //     prevText: '<span class="lnr lnr-chevron-left"></span>'
            // });

             $('.has-sidebar .product-gallery #bx-pager').bxSlider({
                slideWidth: 120,
                minSlides: 4,
                maxSlides: 4,
                slideMargin: 6,
                nextText: '<span class="lnr lnr-chevron-right"></span>',
                prevText: '<span class="lnr lnr-chevron-left"></span>'
              });
        }

        if ($('.none-sidebar .product-gallery .bxslider').length > 0) {

             $('.none-sidebar .product-gallery #bx-pager').bxSlider({
                slideWidth: 126,
                minSlides: 4,
                maxSlides: 4,
                slideMargin: 0,
                mode: 'vertical',
                infiniteLoop: true,
                nextText: '<span class="lnr lnr-chevron-up"></span>',
                prevText: '<span class="lnr lnr-chevron-down"></span>'
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
        //Select Size
        $('.selected-attr-size	span').text($('.select-attr-size li').first().find('a').text());
        $('body').click(function() {
            $('.select-attr-size').slideUp();
        });
        $('.selected-attr-size').click(function(event) {
            event.preventDefault();
            event.stopPropagation();
            $('.select-attr-size').slideToggle();
        });
        $('.select-attr-size a').click(function(event) {
            event.preventDefault();
            $('.select-attr-size a').removeClass('selected');
            $(this).addClass('selected');
            $('.selected-attr-size span').text($(this).text());
        });
        //Sort By
        $('body').click(function() {
            $('.filter-type').slideUp();
        });
        $('.filter-selected').click(function(event) {
            event.preventDefault();
            event.stopPropagation();
            $('.filter-type').slideToggle();
        });
        $('.filter-type a').click(function(event) {
            event.preventDefault();
            $('.filter-type a').removeClass('selected');
            $(this).addClass('selected');
            $('.filter-selected').text($(this).text());
        });
        //Select Color
        $('.attr-color li a').click(function(event) {
            event.preventDefault();
            $('.attr-color li a').removeClass('selected');
            $(this).addClass('selected');
        });
        //Qty Up-Down
        $('.info-qty').each(function() {
            var qtyval = parseInt($(this).find('.qty-val').text());
            $('.qty-up').click(function(event) {
                event.preventDefault();
                qtyval = qtyval + 1;
                $('.qty-val').text(qtyval);
            });
            $('.qty-down').click(function(event) {
                event.preventDefault();
                qtyval = qtyval - 1;
                if (qtyval > 0) {
                    $('.qty-val').text(qtyval);
                } else {
                    qtyval = 0;
                    $('.qty-val').text(qtyval);
                }
            });
        });
    });

    //Window Load
    jQuery(window).load(function() {
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
                    navigation: true,
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
                    navigation: false
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
              else{
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


          $( ".time_circles div[class^='textDiv_']").each(function(){
             var w = $(this).width();
            $(this).height(w);
          });

        });
      }


       
    });

 /////////////////////// to top


  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $('#back-top').addClass('show');
    } else {
      $('#back-top').removeClass('show');
    }
  });

  $('#back-top').click(function () {
    $('body,html').animate({
      scrollTop: 0
    }, 800);
    return false;
  });

})(jQuery); // End of use strict


// Ajax filter collection
jQuery(function($) {
    $(document).delegate('.advanced-filter > a', 'click', function() {
        history.pushState({}, document.title, this.href);
        var b = $('body').addClass('ajaxing'),
            h = $('html,body');
        $('#box').load([this.href, '#collection'].join(' '), function() {
            
            //TEST
            ajaxifyShopifyInit();
           
            b.removeClass('ajaxing');
            h.animate({ scrollTop: $('#box').offset().top });
        });
        return false;
    });


    //wishlist
    // ======================================================
    // remove from wishlist
    // ======================================================
    $(".js-remove-button").on("click", function(e) {
      e.preventDefault();
      removeFromWishlist($(this));
    });

    // ======================================================
    // add to cart from wishlist
    // ======================================================
    $(".js-add-to-cart").on("click", function(e) {
      e.preventDefault();
      variantID = $(this).attr("data-id");
      $('#product-select').attr("value", variantID);
      // uncomment next line if you want a product to be removed from the wish list when it is added to the cart
      removeFromWishlist($(this));
      $('#add-variant').submit();
    });

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