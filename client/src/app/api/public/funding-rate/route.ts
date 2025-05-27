import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Получаем параметры запроса
    const searchParams = request.nextUrl.searchParams;
    const instId = searchParams.get('instId');

    // Проверяем обязательные параметры
    if (!instId) {
      return NextResponse.json(
        { message: 'Параметр instId обязателен' },
        { status: 400 }
      );
    }

    // Формируем URL для запроса к серверу
    const serverUrl = new URL('http://localhost:3001/api/public/funding-rate');
    
    // Добавляем параметры запроса
    serverUrl.searchParams.append('instId', instId);

    // Отправляем запрос к локальному серверу
    const response = await fetch(serverUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Получаем ответ
    const data = await response.json();

    // Если ответ не успешный, возвращаем ошибку
    if (!response.ok) {
      console.error('Error getting funding rate:', data);
      return NextResponse.json(
        { message: data.message || 'Error getting funding rate' },
        { status: response.status }
      );
    }

    // Возвращаем успешный ответ
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error during request execution:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
