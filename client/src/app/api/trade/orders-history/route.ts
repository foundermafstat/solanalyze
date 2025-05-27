import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Получаем параметры запроса
    const searchParams = request.nextUrl.searchParams;
    const instType = searchParams.get('instType');
    const instId = searchParams.get('instId');
    const ordType = searchParams.get('ordType');
    const state = searchParams.get('state');
    const limit = searchParams.get('limit');

    // Проверяем обязательные параметры
    if (!instType) {
      return NextResponse.json(
        { message: 'Параметр instType обязателен' },
        { status: 400 }
      );
    }

    // Формируем URL для запроса к серверу
    const serverUrl = new URL('http://localhost:3001/api/trading/orders/history');
    
    // Добавляем параметры запроса
    serverUrl.searchParams.append('instType', instType);
    if (instId) serverUrl.searchParams.append('instId', instId);
    if (ordType) serverUrl.searchParams.append('ordType', ordType);
    if (state) serverUrl.searchParams.append('state', state);
    if (limit) serverUrl.searchParams.append('limit', limit);

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
      console.error('Ошибка при получении истории ордеров:', data);
      return NextResponse.json(
        { message: data.message || 'Ошибка при получении истории ордеров' },
        { status: response.status }
      );
    }

    // Возвращаем успешный ответ
    return NextResponse.json(data);
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
