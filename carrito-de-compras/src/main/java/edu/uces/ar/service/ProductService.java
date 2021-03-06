package edu.uces.ar.service;

import java.util.List;

import org.springframework.stereotype.Service;

import edu.uces.ar.model.dto.ProductDTO;

@Service
public interface ProductService {

	List<ProductDTO> getAllProducts();
	
	ProductDTO getProductByProductId(Long id);
	
	ProductDTO putProduct(ProductDTO product);
	
	void deleteProductById(Long id);
}
