# Full Guide: Building the Spring Boot Backend for Acople-ShopTCG

This document provides a complete, step-by-step guide to creating a monolithic Spring Boot backend that supports your React frontend. It includes project setup, configuration, and all the necessary Java code for models, repositories, services, and controllers.

---

## Part 1: Project Setup with Spring Initializr

First, we need to create the Spring Boot project with the correct dependencies.

1.  **Go to [start.spring.io](https://start.spring.io/).**
2.  **Configure the project metadata:**
    *   **Project:** `Maven`
    *   **Language:** `Java`
    *   **Spring Boot:** `3.2.x` (or your preferred stable version)
    *   **Group:** `com.acople`
    *   **Artifact:** `shoptcg`
    *   **Name:** `shoptcg`
    *   **Packaging:** `Jar`
    *   **Java:** `17` (or newer)
3.  **Add Dependencies:** In the "Dependencies" section, click "Add Dependencies" and include the following:
    *   `Spring Web`: For creating REST controllers.
    *   `Spring Data JPA`: For database interaction.
    *   `PostgreSQL Driver`: To connect to your Render PostgreSQL database.
    *   `Lombok`: To reduce boilerplate code (like getters, setters, constructors).
4.  **Click "Generate".** A `.zip` file will be downloaded. Unzip it and open the project in your favorite IDE (like IntelliJ IDEA or VS Code).

---

## Part 2: Database Configuration

Before writing code, let's configure the application to connect to your database. Render provides a connection string URL.

Open `src/main/resources/application.properties` and add the following properties:

```properties
# PostgreSQL Database Configuration
# Get this URL from your Render.com database page
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
# This will automatically create/update your database schema based on your entities
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

**Important:** You will set the `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` as environment variables in the Render deployment environment. For local testing, you can replace the `${...}` placeholders with your local database credentials.

---

## Part 3: Authentication (User Model)

As requested, this is a simplified authentication system without Spring Security.

#### 1. Model: `User.java`
Create a `model` package (`com.acople.shoptcg.model`) and add this class.

```java
package com.acople.shoptcg.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "app_user") // "user" is a reserved keyword in SQL
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private String role; // e.g., "ADMIN" or "CUSTOMER"
}
```

#### 2. Repository: `UserRepository.java`
Create a `repository` package (`com.acople.shoptcg.repository`) and add this interface.

```java
package com.acople.shoptcg.repository;

import com.acople.shoptcg.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
```

#### 3. Service: `AuthService.java`
Create a `service` package (`com.acople.shoptcg.service`) and add this class.

```java
package com.acople.shoptcg.service;

import com.acople.shoptcg.model.User;
import com.acople.shoptcg.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> login(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Simple password check (in a real app, use hashing!)
            if (user.getPassword().equals(password)) {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }
    
    public User register(User user) {
        // In a real app, add validation and password hashing
        return userRepository.save(user);
    }
}
```

#### 4. Controller: `AuthController.java`
Create a `controller` package (`com.acople.shoptcg.controller`) and add this class. We'll also define a simple DTO (Data Transfer Object) for the login request.

**LoginRequest.java (DTO)**
```java
package com.acople.shoptcg.controller;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
```

**AuthController.java**
```java
package com.acople.shoptcg.controller;

import com.acople.shoptcg.model.User;
import com.acople.shoptcg.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        User registeredUser = authService.register(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Do not send the password back to the frontend
            user.setPassword(null); 
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
```

---

## Part 4: Products

This follows the same pattern: Model, Repository, Service, Controller.

#### 1. Model: `Product.java`
In the `model` package:

```java
package com.acople.shoptcg.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String slug;
    private String description;
    private double price;
    private int stock;
    private String category; // "single", "carpetas", "dados", etc.
    private String game; // "magic", "pokemon", "accesorio", etc.
}
```

#### 2. Repository: `ProductRepository.java`
In the `repository` package:

```java
package com.acople.shoptcg.repository;

import com.acople.shoptcg.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);

    @Query("SELECT DISTINCT p.category FROM Product p")
    List<String> findDistinctCategories();
}
```

#### 3. Service: `ProductService.java`
In the `service` package:

```java
package com.acople.shoptcg.service;

import com.acople.shoptcg.model.Product;
import com.acople.shoptcg.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Optional<Product> getProductBySlug(String slug) {
        return productRepository.findBySlug(slug);
    }

    public List<String> getUniqueCategories() {
        return productRepository.findDistinctCategories();
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Optional<Product> updateProduct(Long id, Product productDetails) {
        return productRepository.findById(id).map(product -> {
            product.setName(productDetails.getName());
            product.setSlug(productDetails.getSlug());
            product.setDescription(productDetails.getDescription());
            product.setPrice(productDetails.getPrice());
            product.setStock(productDetails.getStock());
            product.setCategory(productDetails.getCategory());
            product.setGame(productDetails.getGame());
            return productRepository.save(product);
        });
    }

    public boolean deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
```

#### 4. Controller: `ProductController.java`
In the `controller` package:

```java
package com.acople.shoptcg.controller;

import com.acople.shoptcg.model.Product;
import com.acople.shoptcg.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Product> getProductBySlug(@PathVariable String slug) {
        return productService.getProductBySlug(slug)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return productService.getUniqueCategories();
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        return productService.updateProduct(id, productDetails)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        return productService.deleteProduct(id) 
            ? ResponseEntity.noContent().build() 
            : ResponseEntity.notFound().build();
    }
}
```

---

## Part 5: Server-Side Cart

The API contract implies a server-side cart linked to a user. This is a good approach for logged-in users.

#### 1. Model: `CartItem.java`
In the `model` package:

```java
package com.acople.shoptcg.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private int quantity;
}
```

#### 2. Repository: `CartItemRepository.java`
In the `repository` package:

```java
package com.acople.shoptcg.repository;

import com.acople.shoptcg.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);
    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);
    void deleteByUserId(Long userId);
}
```

#### 3. Service: `CartService.java`
In the `service` package:

```java
package com.acople.shoptcg.service;

import com.acople.shoptcg.model.CartItem;
import com.acople.shoptcg.model.Product;
import com.acople.shoptcg.model.User;
import com.acople.shoptcg.repository.CartItemRepository;
import com.acople.shoptcg.repository.ProductRepository;
import com.acople.shoptcg.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<CartItem> getCartItems(Long userId) {
        return cartItemRepository.findByUserId(userId);
    }

    public CartItem addToCart(Long userId, Long productId, int quantity) {
        // Check if item already exists in cart
        Optional<CartItem> existingItemOpt = cartItemRepository.findByUserIdAndProductId(userId, productId);

        if (existingItemOpt.isPresent()) {
            // If it exists, update the quantity
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            return cartItemRepository.save(existingItem);
        } else {
            // If not, create a new cart item
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
            Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
            
            CartItem newItem = new CartItem();
            newItem.setUser(user);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            return cartItemRepository.save(newItem);
        }
    }

    public Optional<CartItem> updateCartItemQuantity(Long userId, Long productId, int quantity) {
        return cartItemRepository.findByUserIdAndProductId(userId, productId)
                .map(cartItem -> {
                    cartItem.setQuantity(quantity);
                    return cartItemRepository.save(cartItem);
                });
    }

    @Transactional
    public boolean removeItemFromCart(Long userId, Long productId) {
        return cartItemRepository.findByUserIdAndProductId(userId, productId).map(cartItem -> {
            cartItemRepository.delete(cartItem);
            return true;
        }).orElse(false);
    }

    @Transactional
    public void clearUserCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }
}
```

#### 4. Controller DTOs
For cleaner requests, create these simple classes inside the `controller` package.

**CartItemRequest.java**
```java
package com.acople.shoptcg.controller;

import lombok.Data;

@Data
public class CartItemRequest {
    private Long userId;
    private Long productId;
    private int quantity;
}
```

**UpdateQuantityRequest.java**
```java
package com.acople.shoptcg.controller;

import lombok.Data;

@Data
public class UpdateQuantityRequest {
    private int quantity;
}
```

#### 5. Controller: `CartController.java`
In the `controller` package:
```java
package com.acople.shoptcg.controller;

import com.acople.shoptcg.model.CartItem;
import com.acople.shoptcg.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    // GET /api/cart?userId=1
    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(@RequestParam Long userId) {
        List<CartItem> cartItems = cartService.getCartItems(userId);
        return ResponseEntity.ok(cartItems);
    }

    // POST /api/cart/items
    @PostMapping("/items")
    public ResponseEntity<CartItem> addToCart(@RequestBody CartItemRequest request) {
        try {
            CartItem cartItem = cartService.addToCart(request.getUserId(), request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(cartItem);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // PUT /api/cart/items/{productId}?userId=1
    @PutMapping("/items/{productId}")
    public ResponseEntity<CartItem> updateCartItem(@PathVariable Long productId, @RequestParam Long userId, @RequestBody UpdateQuantityRequest request) {
        return cartService.updateCartItemQuantity(userId, productId, request.getQuantity())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/cart/items/{productId}?userId=1
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeCartItem(@PathVariable Long productId, @RequestParam Long userId) {
        boolean removed = cartService.removeItemFromCart(userId, productId);
        return removed ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // DELETE /api/cart?userId=1
    @DeleteMapping
    public ResponseEntity<Void> clearCart(@RequestParam Long userId) {
        cartService.clearUserCart(userId);
        return ResponseEntity.noContent().build();
    }
}
```
**Note on API Design:** The frontend must now pass the `userId` in requests related to the cart. This is a standard practice for stateless REST APIs.

---

## Part 6: Orders

This feature allows creating an order from a user's cart.

#### 1. Models: `Order.java` and `OrderItem.java`
In the `model` package:

**Order.java**
```java
package com.acople.shoptcg.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer_order")
@Data
@NoArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    private LocalDateTime orderDate;
    private String status; // e.g., "PENDING", "COMPLETED", "CANCELLED"
    private double totalAmount;
}
```

**OrderItem.java**
```java
package com.acople.shoptcg.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnore // Prevents infinite recursion during serialization
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private int quantity;
    private double price; // Price of the product at the time of purchase
}
```

#### 2. Repositories: `OrderRepository.java` and `OrderItemRepository.java`
In the `repository` package:

**OrderRepository.java**
```java
package com.acople.shoptcg.repository;

import com.acople.shoptcg.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
}
```
*`OrderItemRepository` can be an empty interface just extending `JpaRepository` if no custom queries are needed.*

**OrderItemRepository.java**
```java
package com.acople.shoptcg.repository;

import com.acople.shoptcg.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
```

#### 3. Service: `OrderService.java`
In the `service` package. This service contains the core logic for creating an order.
```java
package com.acople.shoptcg.service;

import com.acople.shoptcg.model.*;
import com.acople.shoptcg.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;

    @Transactional
    public Order createOrderFromCart(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);

        if (cartItems.isEmpty()) {
            throw new IllegalStateException("Cannot create an order from an empty cart.");
        }

        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");

        List<OrderItem> orderItems = cartItems.stream().map(cartItem -> {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                .orElseThrow(() -> new RuntimeException("Product not found in cart processing."));

            // Check for stock before proceeding
            if (product.getStock() < cartItem.getQuantity()) {
                throw new IllegalStateException("Not enough stock for product: " + product.getName());
            }
            // Decrease stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice()); // Capture price at time of purchase
            return orderItem;
        }).collect(Collectors.toList());

        order.setItems(orderItems);
        
        double totalAmount = orderItems.stream()
            .mapToDouble(item -> item.getPrice() * item.getQuantity())
            .sum();
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);
        
        // Clear the user's cart after the order is successfully created
        cartItemRepository.deleteAll(cartItems);
        
        return savedOrder;
    }

    public List<Order> getOrdersForUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }
    
    // For Admin
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }
    
    // For Admin
    public Optional<Order> updateOrderStatus(Long orderId, String status) {
        return orderRepository.findById(orderId).map(order -> {
            order.setStatus(status);
            return orderRepository.save(order);
        });
    }
}
```

#### 4. Controller: `OrderController.java`
In the `controller` package:
```java
package com.acople.shoptcg.controller;

import com.acople.shoptcg.model.Order;
import com.acople.shoptcg.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;
    
    // Create order from cart
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Map<String, Long> payload) {
        Long userId = payload.get("userId");
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Order order = orderService.createOrderFromCart(userId);
            return ResponseEntity.ok(order);
        } catch (IllegalStateException e) {
            // e.g., cart is empty or stock is insufficient
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Get user's own orders
    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders(@RequestParam Long userId) {
        return ResponseEntity.ok(orderService.getOrdersForUser(userId));
    }

    // Get all orders (for admin)
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // Get order by ID
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Update order status (for admin)
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return orderService.updateOrderStatus(id, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
```

---

## Part 7: CORS Configuration

To allow your React frontend (running on `localhost:5173` or similar) to talk to your backend, you need to configure CORS (Cross-Origin Resource Sharing).

Create a `config` package (`com.acople.shoptcg.config`) and add this class:

```java
package com.acople.shoptcg.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**") // Apply to all endpoints under /api
                        .allowedOrigins("http://localhost:5173") // Your frontend URL
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
```
**Note:** When you deploy, you'll need to add your deployed frontend URL to `.allowedOrigins()`.

## Part 7: Final Frontend Change

Your frontend `axios` instance sends an `x-tenant-id` header. Since this simplified backend doesn't use it, you can safely remove that line from your `src/Api/axios.js` file to keep things clean.

```javascript
// src/Api/axios.js

//...
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Use your backend URL
});

// Remove this interceptor or the line that adds the 'x-tenant-id' header
api.interceptors.request.use(
  (config) => {
    // delete config.headers['x-tenant-id']; // Or just remove the line
    // ... rest of the interceptor for Auth token
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
//...
```

This guide provides a solid foundation for your backend. You can now proceed to implement the `Cart` and `Order` functionalities following the same established pattern.

---

## Part 8: Deploying to Render

Once your backend is complete and pushed to a GitHub repository, you can deploy it using Render.

### Prerequisites
1.  **Render Account:** Sign up for a free account at [render.com](https://render.com/).
2.  **GitHub Repository:** Your Spring Boot project code must be in a GitHub (or GitLab/Bitbucket) repository.

### Step 1: Create the PostgreSQL Database
Before deploying the application, create the database it will connect to.

1.  From the Render Dashboard, click **New +** > **PostgreSQL**.
2.  Give your database a unique **Name** (e.g., `acople-shop-db`).
3.  Choose a **Region** close to you.
4.  Select the **Free** plan for this academic project.
5.  Click **Create Database**.
6.  Once the database is created (it may take a minute), go to its page and find the **Connections** section. Keep this page open; you will need the **Internal Database URL**, **Username**, and **Password** for the next step.

### Step 2: Create the Spring Boot Web Service (using Docker)
Your project will be deployed inside a Docker container. This is the standard and most reliable way to run Java applications on Render.

1.  **Push the `Dockerfile`:** Before creating the service, make sure the `Dockerfile` from the previous step is committed and pushed to your GitHub repository.
2.  **Create the Service:** From the Render Dashboard, click **New +** > **Web Service**, and select your backend's GitHub repository.
3.  **Configure Docker Settings:** On the settings page, fill in the following:
    *   **Name:** A unique name for your service (e.g., `acople-shoptcg-backend`).
    *   **Region:** Choose the **same region** as your database for the best performance.
    *   **Branch:** Select the branch you want to deploy (e.g., `main`).
    *   **Runtime:** `Docker`. Render will automatically detect the `Dockerfile` in your repository.
    *   **Instance Type:** `Free`.

    **Important:** When you use the `Docker` runtime, you do **not** need to specify a Build Command or a Start Command in the Render interface. Those instructions are now handled by the `Dockerfile`.

### Step 3: Add Environment Variables
This is the most critical step. It tells your application how to connect to the database you created in Step 1.

1.  Scroll down to the **Advanced** section and click **Add Environment Variable**.
2.  Add the following three variables, copying the values from your Render PostgreSQL "Connections" page:
    *   **Key:** `DB_URL`
        *   **Value:** Paste the **Internal Database URL**. Using the internal URL is faster, more secure, and doesn't count towards public bandwidth limits.
    *   **Key:** `DB_USERNAME`
        *   **Value:** Paste the **Username**.
    *   **Key:** `DB_PASSWORD`
        *   **Value:** Paste the **Password**.

    Your application's `application.properties` file is already configured to read these exact keys.

### Step 4: Deploy
1.  Scroll to the bottom and click **Create Web Service**.
2.  Render will start building and deploying your application. You can watch the progress in the **Logs** tab.
3.  The first build may take several minutes as it downloads all the Maven dependencies. Subsequent builds will be faster.
4.  Once the deployment is successful, you will see a message like `Your service is live 🎉`.

### Step 5: Final Configuration (Frontend and CORS)
Now that your backend is live, you need to connect the frontend to it.

1.  **Get Your Backend URL:** At the top of your web service page in Render, you'll find its public URL, which will look like `https://acople-shoptcg-backend.onrender.com`. Copy this URL.

2.  **Update Frontend API Endpoint:** In your React project, go to `src/Api/axios.js` and change the `baseURL` to your new live backend URL.
    ```javascript
    // src/Api/axios.js
    const api = axios.create({
      baseURL: 'https://acople-shoptcg-backend.onrender.com/api', // <-- Your live backend URL
    });
    ```

3.  **Update Backend CORS Policy:** Your backend currently only allows requests from `localhost`. You must update it to allow requests from your deployed frontend.
    *   In your Spring Boot project, go to the `WebConfig.java` file.
    *   Add the URL of your **deployed frontend** to the `.allowedOrigins()` method. If you haven't deployed your frontend yet, you can find its URL on Render after you create it.
    ```java
    // In com/acople/shoptcg/config/WebConfig.java
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                // Add your deployed frontend URL here
                .allowedOrigins("http://localhost:5173", "https://your-frontend-name.onrender.com") 
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
    ```
    *   Commit and push this change to your GitHub repository. Render will automatically detect the new commit and redeploy your backend with the updated CORS policy.

4.  **Redeploy Frontend:** After updating the `baseURL` in your frontend code, commit, push, and (if it's already deployed) redeploy your frontend application. It will now make requests to your live backend.

Your full-stack application is now live on Render!