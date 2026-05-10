package com.revelio.api.client;

import com.revelio.api.dto.BlogResponseDto;
import com.revelio.api.exception.BlogServiceException;
import java.util.List;

public class BlogApiClientImpl implements BlogApiClient {

  private static final String ERROR_MESSAGE = "Something went wrong. Please try again.";
  private final BlogApiHttpClient httpClient;

  public BlogApiClientImpl(BlogApiHttpClient httpClient) {
    this.httpClient = httpClient;
  }

  @Override
  public List<BlogResponseDto> fetchBlogs(int page, int size) throws BlogServiceException {
    try {
      return httpClient.get("/api/blogs", page, size);
    } catch (Exception e) {
      throw new BlogServiceException(ERROR_MESSAGE, e);
    }
  }
}