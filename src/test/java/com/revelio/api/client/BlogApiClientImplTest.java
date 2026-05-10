package com.revelio.api.client;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.revelio.api.dto.BlogResponseDto;
import com.revelio.api.exception.BlogServiceException;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class BlogApiClientImplTest {

  @Mock private BlogApiHttpClient httpClient;

  private BlogApiClientImpl blogApiClient;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    blogApiClient = new BlogApiClientImpl(httpClient);
  }

  @Test
  void testFetchBlogsReturnsSuccessfully() throws Exception {
    BlogResponseDto.AuthorDto author =
        new BlogResponseDto.AuthorDto("John Doe", "https://example.com/john.jpg");
    BlogResponseDto blog1 =
        new BlogResponseDto(
            1L,
            "First Post",
            "First excerpt",
            "https://example.com/1.jpg",
            author,
            Arrays.asList("tech", "java"),
            Instant.parse("2024-01-15T10:00:00Z"));
    BlogResponseDto blog2 =
        new BlogResponseDto(
            2L,
            "Second Post",
            "Second excerpt",
            "https://example.com/2.jpg",
            author,
            Arrays.asList("design"),
            Instant.parse("2024-01-20T10:00:00Z"));
    List<BlogResponseDto> expectedBlogs = Arrays.asList(blog1, blog2);

    when(httpClient.get("/api/blogs", 0, 10)).thenReturn(expectedBlogs);

    List<BlogResponseDto> result = blogApiClient.fetchBlogs(0, 10);

    assertEquals(expectedBlogs, result);
    verify(httpClient, times(1)).get("/api/blogs", 0, 10);
  }

  @Test
  void testFetchBlogsThrowsBlogServiceExceptionOnHttpClientFailure() throws Exception {
    when(httpClient.get("/api/blogs", 0, 10)).thenThrow(new RuntimeException("Network error"));

    BlogServiceException exception =
        assertThrows(BlogServiceException.class, () -> blogApiClient.fetchBlogs(0, 10));

    assertEquals("Something went wrong. Please try again.", exception.getMessage());
    assertNotNull(exception.getCause());
    assertEquals("Network error", exception.getCause().getMessage());
    verify(httpClient, times(1)).get("/api/blogs", 0, 10);
  }

  @Test
  void testFetchBlogsThrowsBlogServiceExceptionOnTimeout() throws Exception {
    when(httpClient.get("/api/blogs", 0, 10))
        .thenThrow(new RuntimeException("Connection timeout"));

    BlogServiceException exception =
        assertThrows(BlogServiceException.class, () -> blogApiClient.fetchBlogs(0, 10));

    assertEquals("Something went wrong. Please try again.", exception.getMessage());
    assertNotNull(exception.getCause());
    verify(httpClient, times(1)).get("/api/blogs", 0, 10);
  }

  @Test
  void testFetchBlogsThrowsBlogServiceExceptionOn500Error() throws Exception {
    when(httpClient.get("/api/blogs", 0, 10))
        .thenThrow(new RuntimeException("Internal server error"));

    BlogServiceException exception =
        assertThrows(BlogServiceException.class, () -> blogApiClient.fetchBlogs(0, 10));

    assertEquals("Something went wrong. Please try again.", exception.getMessage());
    assertNotNull(exception.getCause());
    verify(httpClient, times(1)).get("/api/blogs", 0, 10);
  }

  @Test
  void testFetchBlogsWithDifferentPageAndSize() throws Exception {
    BlogResponseDto.AuthorDto author =
        new BlogResponseDto.AuthorDto("Jane Smith", "https://example.com/jane.jpg");
    BlogResponseDto blog =
        new BlogResponseDto(
            3L,
            "Third Post",
            "Third excerpt",
            "https://example.com/3.jpg",
            author,
            Arrays.asList("spring"),
            Instant.parse("2024-01-25T10:00:00Z"));
    List<BlogResponseDto> expectedBlogs = Arrays.asList(blog);

    when(httpClient.get("/api/blogs", 1, 5)).thenReturn(expectedBlogs);

    List<BlogResponseDto> result = blogApiClient.fetchBlogs(1, 5);

    assertEquals(expectedBlogs, result);
    verify(httpClient, times(1)).get("/api/blogs", 1, 5);
  }

  @Test
  void testFetchBlogsReturnsEmptyListWhenNoBlogs() throws Exception {
    when(httpClient.get("/api/blogs", 0, 10)).thenReturn(Arrays.asList());

    List<BlogResponseDto> result = blogApiClient.fetchBlogs(0, 10);

    assertTrue(result.isEmpty());
    verify(httpClient, times(1)).get("/api/blogs", 0, 10);
  }

  @Test
  void testFetchBlogsCanBeRetriedAfterException() throws Exception {
    when(httpClient.get("/api/blogs", 0, 10))
        .thenThrow(new RuntimeException("Network error"))
        .thenReturn(Arrays.asList());

    assertThrows(BlogServiceException.class, () -> blogApiClient.fetchBlogs(0, 10));

    List<BlogResponseDto> result = blogApiClient.fetchBlogs(0, 10);

    assertTrue(result.isEmpty());
    verify(httpClient, times(2)).get("/api/blogs", 0, 10);
  }
}
