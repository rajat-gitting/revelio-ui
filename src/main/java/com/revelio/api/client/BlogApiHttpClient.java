package com.revelio.api.client;

import com.revelio.api.dto.BlogResponseDto;
import java.util.List;

public interface BlogApiHttpClient {
  List<BlogResponseDto> get(String path, int page, int size) throws Exception;
}