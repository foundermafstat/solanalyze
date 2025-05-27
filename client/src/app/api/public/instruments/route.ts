import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Получаем параметры запроса
    const searchParams = request.nextUrl.searchParams;
    const instType = searchParams.get('instType');
    const uly = searchParams.get('uly');
    const instId = searchParams.get('instId');

    // Проверяем обязательные параметры
    if (!instType) {
      return NextResponse.json(
        { message: 'Parameter instType is required' },
        { status: 400 }
      );
    }

    // Проверяем, запущен ли сервер
    try {
      await fetch('http://localhost:3001/api/status', { method: 'GET' });
    } catch (serverError) {
      console.error('Error connecting to server:', serverError);
      return NextResponse.json(
        { message: 'Failed to connect to server. Ensure that the server is running on port 3001.' },
        { status: 503 }
      );
    }

    // Формируем URL для запроса к серверу
    const serverUrl = new URL('http://localhost:3001/api/public/instruments');
    
    // Добавляем параметры запроса
    serverUrl.searchParams.append('instType', instType);
    if (uly) serverUrl.searchParams.append('uly', uly);
    if (instId) serverUrl.searchParams.append('instId', instId);

    // Отправляем запрос к локальному серверу
    const response = await fetch(serverUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Проверяем тип содержимого ответа
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Server returned non-JSON:', textResponse.substring(0, 200));
      return NextResponse.json(
        { 
          message: 'Server returned incorrect data format',
          error: 'INVALID_RESPONSE_FORMAT'
        },
        { status: 500 }
      );
    }
        { status: 500 }
      );
    }
    
    // Получаем ответ как JSON
    const data = await response.json();

    // Если ответ не успешный, возвращаем ошибку
    if (!response.ok) {
      console.error('Error getting public instruments:', data);
      return NextResponse.json(
        { message: data.message || 'Error getting public instruments' },
        { status: response.status }
      );
    }

    // Возвращаем успешный ответ
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error during request execution:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
