import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Получаем параметры запроса
    const searchParams = request.nextUrl.searchParams;
    const instType = searchParams.get('instType');
    const uly = searchParams.get('uly');
    const instFamily = searchParams.get('instFamily');

    // Проверяем обязательные параметры
    if (!instType) {
      return NextResponse.json(
        { message: 'Параметр instType обязателен' },
        { status: 400 }
      );
    }

    // Формируем URL для запроса к серверу
    const serverUrl = new URL('http://localhost:3001/api/market/tickers');
    
    // Добавляем параметры запроса
    serverUrl.searchParams.append('instType', instType);
    if (uly) serverUrl.searchParams.append('uly', uly);
    if (instFamily) serverUrl.searchParams.append('instFamily', instFamily);

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
      console.error('Error getting market tickers:', data);
      return NextResponse.json(
        { message: data.message || 'Error getting market tickers' },
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
