package com.revelio.api.exception;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class BlogServiceExceptionTest {

  @Test
  void testConstructorWithMessage() {
    String message = "Something went wrong. Please try again.";
    BlogServiceException exception = new BlogServiceException(message);

    assertEquals(message, exception.getMessage());
    assertNull(exception.getCause());
  }

  @Test
  void testConstructorWithMessageAndCause() {
    String message = "Something went wrong. Please try again.";
    Throwable cause = new RuntimeException("Network error");
    BlogServiceException exception = new BlogServiceException(message, cause);

    assertEquals(message, exception.getMessage());
    assertEquals(cause, exception.getCause());
  }

  @Test
  void testExceptionCanBeThrown() {
    assertThrows(
        BlogServiceException.class,
        () -> {
          throw new BlogServiceException("Something went wrong. Please try again.");
        });
  }

  @Test
  void testExceptionCanBeCaught() {
    try {
      throw new BlogServiceException("Something went wrong. Please try again.");
    } catch (BlogServiceException e) {
      assertEquals("Something went wrong. Please try again.", e.getMessage());
    }
  }
}