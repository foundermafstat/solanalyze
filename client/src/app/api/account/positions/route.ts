import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Получаем параметры запроса
    const searchParams = request.nextUrl.searchParams;
    const instType = searchParams.get('instType');
    const instId = searchParams.get('instId');
    const posId = searchParams.get('posId');

    // Формируем URL для запроса к серверу
    const serverUrl = new URL('http://localhost:3001/api/account/positions');
    
    // Добавляем параметры запроса
    if (instType) serverUrl.searchParams.append('instType', instType);
    if (instId) serverUrl.searchParams.append('instId', instId);
    if (posId) serverUrl.searchParams.append('posId', posId);

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
      console.error('Error getting account positions:', data);
      return NextResponse.json(
        { message: data.message || 'Error getting account positions' },
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
