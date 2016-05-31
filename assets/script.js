(function($) {
    "use strict"; // Start of use strict
    //Document Ready
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
                if ($(this).hasClass('active')) {
                    $(this).removeClass('active');
                } else {
                    $(this).addClass('active');
                }
            });
        }





        


         var t = window.initAjaxProduct = {
            atTimeout: null,
            isSidebarAjaxClick: false,
            go: function() {
              this.goMiniCart();//add cart
              this.goAddToCart();
              // this.goProductAddToCart();
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
              var cart = '<li class="mini_cart_item" id="cart-item-{ID}"><a href="{URL}" title="{TITLE}" class="product-image"><img src="{IMAGE}" alt="{TITLE}"></a><div class="product-inner"><a href="javascript:void(0)" title="Remove Item" class="btn-remove"><i class=" icon-delete-outline"></i></a><p class="product-name"><a href="{URL}">{TITLE}</a></p><div class="cart-collateral"><span class="price">{PRICE}</span>(x {QUANTITY})</div></div></li>';
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
              if ($(".product-add-cart").length > 0) {
                $(".product-add-cart").click(function(n) {
                  console.log('click');
                  n.preventDefault();
                 

                  if ($(this).attr("disabled") != "disabled") {
                    var cart = $(this).parents(".item-product");
                    var i = $(cart).attr("id");
                    i = i.match(/\d+/g);
                    alert(!window.ajax_cart );
                    if (!window.ajax_cart) {
                      $("#product-actions-" + i).submit()
                    } else {
                      var s = $("#product-actions-" + i + " select[name=id]").val();
                      if (!s) {
                        s = $("#product-actions-" + i + " input[name=id]").val()
                      }
                      var o = $("#product-actions-" + i + " input[name=quantity]").val();
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
                   alert('success');
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

        }
          
        t.go();

        //Product Load More
        // $('.list-product-loadmore').each(function() {
        //     var size_li = $(this).find(".list-product li").size();
        //     var x = $(this).find('.btn-link-loadmore').attr('data-num');
        //     var y = parseInt($(this).find('.btn-link-loadmore').attr('data-num')) - 1;
        //     $(this).find('.list-product li:lt(' + x + ')').show();
        //     $(this).find('.list-product li:gt(' + y + ')').hide();
        //     $(this).find('.btn-link-loadmore').click(function() {
        //         var size_li = $(this).prev().find("li").size();
        //         var x = $(this).attr('data-num');
        //         var x = parseInt($(this).attr('data-num'));
        //         $(this).attr('data-num', x + 4);
        //         var x = $(this).attr('data-num');
        //         $(this).prev().find('li:lt(' + x + ')').show();
        //         if ($(this).attr('data-num') > size_li) {
        //             $(this).hide();
        //         }
        //     });
        // });

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
        //Accordions
        // if ($('.accordion-box').length > 0) {
        //     $('.accordion-box').each(function() {
        //         $('.title-accordion').click(function() {
        //             $(this).parent().parent().find('.item-accordion').removeClass('active');
        //             $(this).parent().addClass('active');
        //             $(this).parent().parent().find('.desc-accordion').stop(true, true).slideUp();
        //             $(this).next().stop(true, true).slideDown();
        //         });
        //     });
        // }

     




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
        //Product Slider
        if ($('.product-slider').length > 0) {
            $('.none-sidebar .product-slider').each(function() {
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
        if ($('.product-slider').length > 0) {
            $('.arrow-style.product-slider').each(function() {
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
        //Default Product Slider
        if ($('.product-slider').length > 0) {
            $('.has-sidebar .product-slider').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 2],
                        [768, 3],
                        [992, 3],
                        [1200, 3]
                    ],
                    pagination: false,
                    navigation: true,
                });
            });
        }
        //Post Slider
        if ($('.post-gallery').length > 0) {
            $('.post-gallery').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 2],
                        [768, 3],
                        [992, 3],
                        [1200, 3]
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
        //The Brand
        if ($('.the-brand').length > 0) {
            $('.the-brand').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 1],
                        [768, 1],
                        [992, 1],
                        [1200, 1]
                    ],
                    pagination: true,
                    navigation: false,
                    singleItem: true,
                    transitionStyle: "fade"
                });
            });
        }
        //Testimonial Slider
        if ($('.testimonial-slider').length > 0) {
            $('.testimonial-slider').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 1],
                        [768, 1],
                        [992, 1],
                        [1200, 1]
                    ],
                    pagination: true,
                    navigation: false,
                });
            });
        }
        if ($('.home-testimonial-slider').length > 0) {
            $('.home-testimonial-slider').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 1],
                        [768, 1],
                        [992, 1],
                        [1200, 1]
                    ],
                    pagination: false,
                    navigation: true,
                    singleItem: true,
                    transitionStyle: "fade",
                    navigationText: ['<span class="lnr lnr-arrow-left-circle"></span>', '<span class="lnr lnr-arrow-right-circle"></span>']
                });
            });
        }
        //Home Feaured Slider
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
        //Slider Paginav
        if ($('.slider-paginav').length > 0) {
            $('.slider-paginav').each(function() {
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
                    navigation: false,
                });
                $(this).find('.owl-theme .owl-controls .owl-page').each(function() {
                    var num = $(this).index() + 1;
                    $(this).find('span').text(num);
                });
            });
        }
        //Banner Circle Slider
        if ($('.banner-slider-circle-vertical').length > 0) {
            $('.banner-slider-circle-vertical').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 1],
                        [768, 1],
                        [992, 1],
                        [1200, 1]
                    ],
                    pagination: true,
                    navigation: false,
                });
            });
        }
        //Banner Rect Slider
        if ($('.banner-slider-rect-vertical').length > 0) {
            $('.banner-slider-rect-vertical').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 1],
                        [768, 1],
                        [992, 1],
                        [1200, 1]
                    ],
                    pagination: true,
                    navigation: false,
                });
            });
        }
        //Banner Hoztical Slider
        if ($('.banner-slider-circle-hoztical').length > 0) {
            $('.banner-slider-circle-hoztical').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 1],
                        [768, 1],
                        [992, 1],
                        [1200, 1]
                    ],
                    pagination: true,
                    navigation: false,
                });
            });
        }
        //Banner Slider
        if ($('.banner-slider').length > 0) {
            $('.banner-slider').each(function() {

                //TODO
                // container.find('.item').each(function() {
                //     var ev = $(this).find('.slide-video').first();
                //     ev.length && ev.get(0).play();
                // });

                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 1],
                        [768, 1],
                        [992, 1],
                        [1200, 1]
                    ],
                    pagination: false,
                    navigation: true,
                    autoPlay: false,
                    navigationText: ['<span class="lnr lnr-chevron-left"></span>', '<span class="lnr lnr-chevron-right"></span>']
                });
            });
        }


        //Product Tab Slider
        if ($('.product-tab-slider').length > 0) {
            $('.product-tab-slider').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 1],
                        [768, 1],
                        [992, 1],
                        [1200, 1]
                    ],
                    pagination: false,
                    navigation: true,
                    navigationText: ['<span class="lnr lnr-chevron-left"></span>', '<span class="lnr lnr-chevron-right"></span>']
                });
            });
        }
        //Product New Slider
        if ($('.new-product').length > 0) {
            $('.new-product').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 1],
                        [768, 1],
                        [992, 1],
                        [1200, 1]
                    ],
                    pagination: false,
                    navigation: true,
                    navigationText: ['<span class="lnr lnr-chevron-left"></span>', '<span class="lnr lnr-chevron-right"></span>']
                });
            });
        }
        //Popular Post
        if ($('.popular-post').length > 0) {
            $('.popular-post').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 1],
                        [768, 1],
                        [992, 1],
                        [1200, 1]
                    ],
                    pagination: true,
                    navigation: false,
                });
            });
        }

                //Popular Post
        if ($('.slider-4-items').length > 0) {
            $('.slider-4-items').each(function() {
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

        if ($('.slider-5-items').length > 0) {
            $('.slider-5-items').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 1],
                        [768, 1],
                        [992, 1],
                        [1200, 1]
                    ],
                    pagination: true,
                    navigation: false,
                });
            });
        }
        //Header Slider
        if ($('.header-slider').length > 0) {
            $('.header-slider').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 1],
                        [768, 1],
                        [992, 1],
                        [1200, 1]
                    ],
                    pagination: true,
                    navigation: false,
                    autoPlay: true,
                });
            });
        }
        //Default Paginav
        if ($('.default-paginav').length > 0) {
            $('.default-paginav').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 1],
                        [768, 1],
                        [992, 1],
                        [1200, 1]
                    ],
                    pagination: true,
                    navigation: false,
                });
            });
        }
        if ($('.home-latest-news .default-directnav').length > 0) {
            $('.home-latest-news .default-directnav').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 1],
                        [768, 1],
                        [992, 1],
                        [1200, 1]
                    ],
                    pagination: false,
                    navigation: true,
                    navigationText: ['<span class="lnr lnr-arrow-left-circle"></span>', '<span class="lnr lnr-arrow-right-circle"></span>']
                });
            });
        }
        if ($('.default-directnav').length > 0) {
            $('.default-directnav').each(function() {
                $(this).find('.wrap-item').owlCarousel({
                    items: 1,
                    itemsCustom: [
                        [0, 1],
                        [480, 1],
                        [768, 1],
                        [992, 1],
                        [1200, 1]
                    ],
                    pagination: false,
                    navigation: true,
                    navigationText: ['<span class="lnr lnr-arrow-left-circle"></span>', '<span class="lnr lnr-arrow-right-circle"></span>']
                });
            });
        }
        //Time Circle
        if ($('.deal-countdown').length > 0) {
            $(".deal-countdown").TimeCircles({
                fg_width: 0.05,
                bg_width: 0,
                text_size: 0,
                circle_bg_color: "#5f6062",
                time: {
                    Days: {
                        show: true,
                        text: "",
                        color: "#fff"
                    },
                    Hours: {
                        show: true,
                        text: "",
                        color: "#fff"
                    },
                    Minutes: {
                        show: true,
                        text: "",
                        color: "#fff"
                    },
                    Seconds: {
                        show: true,
                        text: "",
                        color: "#fff"
                    }
                }
            });
        }
        if ($('.hotdeal-countdown').length > 0) {
            $(".hotdeal-countdown").TimeCircles({
                fg_width: 0.03,
                bg_width: 0,
                text_size: 0,
                circle_bg_color: "#1b1d1f",
                time: {
                    Days: {
                        show: true,
                        text: "DAY",
                        color: "#fbb450"
                    },
                    Hours: {
                        show: true,
                        text: "HOUR",
                        color: "#fbb450"
                    },
                    Minutes: {
                        show: true,
                        text: "MIN",
                        color: "#fbb450"
                    },
                    Seconds: {
                        show: true,
                        text: "SEC",
                        color: "#fbb450"
                    }
                }
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

            //OSmasonryLayout();  
            b.removeClass('ajaxing');
            h.animate({ scrollTop: $('#box').offset().top });
        });
        return false;
    });


    $(window).load(function() {

        Circles.create({
            id: 'chart-1',
            radius: 150,
            value: 47,
            maxValue: 100,
            width: 3,
            colors: ['#e5e5e5', '#ffd21e'],
            duration: 800,
            wrpClass: 'circles-wrp',
            textClass: 'circles-text',
            valueStrokeClass: 'circles-valueStroke',
            maxValueStrokeClass: 'circles-maxValueStroke',
            styleWrapper: true,
            styleText: true
        });

        Circles.create({
            id: 'chart-2',
            radius: 150,
            value: 68,
            maxValue: 100,
            width: 3,
            colors: ['#e5e5e5', '#2ea0d7'],
            duration: 800,
            wrpClass: 'circles-wrp',
            textClass: 'circles-text',
            valueStrokeClass: 'circles-valueStroke',
            maxValueStrokeClass: 'circles-maxValueStroke',
            styleWrapper: true,
            styleText: true
        });

        Circles.create({
            id: 'chart-3',
            radius: 150,
            value: 93,
            maxValue: 100,
            width: 3,
            colors: ['#e5e5e5', '#1b1d1f'],
            duration: 800,
            wrpClass: 'circles-wrp',
            textClass: 'circles-text',
            valueStrokeClass: 'circles-valueStroke',
            maxValueStrokeClass: 'circles-maxValueStroke',
            styleWrapper: true,
            styleText: true
        });

        Circles.create({
            id: 'chart-4',
            radius: 62,
            value: 75,
            maxValue: 100,
            width: 2,
            colors: ['#2ea0d7', '#fff'],
            duration: 800,
            wrpClass: 'circles-wrp',
            textClass: 'circles-text',
            valueStrokeClass: 'circles-valueStroke',
            maxValueStrokeClass: 'circles-maxValueStroke',
            styleWrapper: true,
            styleText: true
        });

        Circles.create({
            id: 'chart-5',
            radius: 62,
            value: 50,
            maxValue: 100,
            width: 2,
            colors: ['#ffd56a', '#fff'],
            duration: 800,
            wrpClass: 'circles-wrp',
            textClass: 'circles-text',
            valueStrokeClass: 'circles-valueStroke',
            maxValueStrokeClass: 'circles-maxValueStroke',
            styleWrapper: true,
            styleText: true
        });

        Circles.create({
            id: 'chart-6',
            radius: 62,
            value: 95,
            maxValue: 100,
            width: 3,
            colors: ['#fff', '#1b1d1f'],
            duration: 800,
            wrpClass: 'circles-wrp',
            textClass: 'circles-text',
            valueStrokeClass: 'circles-valueStroke',
            maxValueStrokeClass: 'circles-maxValueStroke',
            styleWrapper: true,
            styleText: true
        });
        Circles.create({
            id: 'chart-7',
            radius: 62,
            value: 67,
            maxValue: 100,
            width: 2,
            colors: ['#fff', '#1b1d1f'],
            duration: 800,
            wrpClass: 'circles-wrp',
            textClass: 'circles-text',
            valueStrokeClass: 'circles-valueStroke',
            maxValueStrokeClass: 'circles-maxValueStroke',
            styleWrapper: true,
            styleText: true
        });
        Circles.create({
            id: 'chart-8',
            radius: 62,
            value: 18,
            maxValue: 100,
            width: 2,
            colors: ['#424242', '#ffd21e'],
            duration: 800,
            wrpClass: 'circles-wrp',
            textClass: 'circles-text',
            valueStrokeClass: 'circles-valueStroke',
            maxValueStrokeClass: 'circles-maxValueStroke',
            styleWrapper: true,
            styleText: true
        });
    });

    if( $('.pieChart').length > 0 && $('.pie-chart').length > 0){
        $('#source1').pieChart('#target1');
        $('#source2').pieChart('#target2');
        $('#source3').pieChart('#target3');
        $('#source4').pieChart('#target4');
        $('#source5').pieChart('#target5');
    } 

   

    $("#progressbar-1").progressbar({
        value: 70
    });
    $("#progressbar-2").progressbar({
        value: 50
    });
    $("#progressbar-3").progressbar({
        value: 62
    });
    $("#progressbar-4").progressbar({
        value: 90
    });
    $("#progressbar-5").progressbar({
        value: 83
    });
    $("#progressbar-6").progressbar({
        value: 41
    });
    $("#progressbar-7").progressbar({
        value: 31
    });
    $("#progressbar-8").progressbar({
        value: 12
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