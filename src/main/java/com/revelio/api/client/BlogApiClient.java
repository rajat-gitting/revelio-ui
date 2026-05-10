package com.revelio.api.client;

import com.revelio.api.dto.BlogResponseDto;
import com.revelio.api.exception.BlogServiceException;
import java.util.List;

public interface BlogApiClient {
  List<BlogResponseDto> fetchBlogs(int page, int size) throws BlogServiceException;
}