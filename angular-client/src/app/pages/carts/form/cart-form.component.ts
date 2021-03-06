import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartDTO } from '../entity/cart';
import { CartService } from '../service/cart.service';
import { ProductsService } from 'app/pages/products/service/products.service';
import { ProductDTO } from 'app/pages/products/entity/product';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CartDialogComponent } from './cart-dialog.component';
import { CartProductDTO } from '../entity/cartProduct';

@Component({
    selector: 'cart-form-cmp',
    moduleId: module.id,
    templateUrl: 'cart-form.component.html'
})

export class CartFormComponent implements OnInit, AfterViewInit{
    
    public cart: CartDTO = new CartDTO();
    public products: ProductDTO[] = [];
    public productToAdd: ProductDTO;
    public title: string;
    public errorMsg: string;
    public enableCreation: boolean;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private cartService: CartService,
                private productService: ProductsService, 
                private modalService: NgbModal){
    }

    ngOnInit(){
      let cartCreatedId: string = localStorage.getItem('cartCreatedId');  

        if (cartCreatedId) {
          this.enableCreation = false;
          this.cartService.getCartById(parseInt(cartCreatedId)).subscribe(
            resp => {
              this.cart = resp;
              this.title = 'Carrito de Compras Existente: ' + this.cart.id;

              this.productService.getAllSimple().subscribe(
                resp => {
                  this.products = resp;
                },
                error => {
                  this.errorMsg = 'Ha ocurrido un problema obteniendo los productos del carrito: ' + error.error;
                  console.error(error);
                }
              );

            },
            error => {
              this.errorMsg = 'Ha ocurrido un problema obteniendo el carrito: ' + error.error;
              console.error(error);
            });
          
         
        } else {
          this.enableCreation = true;
          this.title = 'Ingrese con sus datos para comenzar a comprar: ' + this.cart.id;
        }
    }

    ngAfterViewInit(){
      
    }

    onSubmit() {

      this.cartService.checkoutCart(this.cart.id).subscribe(
        resp => {
            this.title = this.cart.fullName + ': Su compra se ha completado con éxito. A la brevedad le enviaremos el estado de su solicitud.';
            localStorage.removeItem('cartCreatedId'); 
            this.enableCreation = true;
          },
          error => {

            if (error.status > 300){
              this.errorMsg = 'Ha ocurrido un problema realizando el chexkuot del carrito: ' + error.error;
              console.error(error);
            } else {
              this.title = this.cart.fullName + ': Su compra se ha completado con éxito. A la brevedad le enviaremos el estado de su solicitud.';
              localStorage.removeItem('cartCreatedId'); 
              this.enableCreation = true;
            }
            
          });

    } 

    createCart(){
      let cartCreatedId: string = localStorage.getItem('cartCreatedId');  

      if (cartCreatedId) {
        this.router.navigate(['/cart']);
      } else {

        var cartToCreate = new CartDTO();
        cartToCreate.fullName = this.cart.fullName;
        cartToCreate.email = this.cart.email;

        this.cartService.createCart(cartToCreate).subscribe(
          resp => {
            this.cart = resp;
            this.title = 'Carrito de Compras Creado: ' + this.cart.id;
            localStorage.setItem('cartCreatedId', this.cart.id.toString()); 
            this.enableCreation = false;

            this.productService.getAllSimple().subscribe(
              resp => {
                this.products = resp;
                this.router.navigate(['/cart']);
              },
              error => {
                this.errorMsg = 'Ha ocurrido un problema obteniendo los productos del carrito: ' + error.error;
                console.error(error);
              }
            );
           
          },
          error => {
            this.errorMsg = 'Ha ocurrido un problema creando el carrito: ' + error.error;
            console.error(error);
          });
      }      

    }


    cleanNotification(){
      this.errorMsg = undefined;
    }

    openModal(product: ProductDTO) {
      const modalRef = this.modalService.open(CartDialogComponent);
      var cartProduct: CartProductDTO = new CartProductDTO();
      cartProduct.productId = product.id;

      modalRef.componentInstance.cartProduct = cartProduct;
      modalRef.result.then((result) => {
        
        let cartCreatedId: string = localStorage.getItem('cartCreatedId');  
        this.cartService.addProductToCart(parseInt(cartCreatedId), result).subscribe(
          resp => {
            this.cartService.getCartById(parseInt(cartCreatedId)).subscribe(
              resp => {
                this.cart = resp;
              },
              error => {
                this.errorMsg = 'Ha ocurrido un problema obteniendo los datos del carrito: ' + error.error;
                console.error(error);
              }
            );
          },
          error => {
            this.errorMsg = 'Ha ocurrido un problema agregando el producto al carrito: ' + error.error;
            console.error(error);
          }
        );

      });

    }

    public remove(product){
      let cartCreatedId: string = localStorage.getItem('cartCreatedId'); 

      this.cartService.delete(parseInt(cartCreatedId), product.id).subscribe(
        resp => {
          this.router.navigate(['/cart']);
        },
        error => {
          this.errorMsg = 'Ha ocurrido un problema actualizando el producto: ' + error.error;
          console.error(error);
        });
    }

}
