import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Получаем параметры запроса
    const searchParams = request.nextUrl.searchParams;
    const ccy = searchParams.get('ccy');

    // Формируем URL для запроса к серверу
    const serverUrl = new URL('http://localhost:3001/api/account/balance');
    
    // Добавляем параметры запроса
    if (ccy) serverUrl.searchParams.append('ccy', ccy);

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
      console.error('Ошибка при получении баланса:', data);
      return NextResponse.json(
        { message: data.message || 'Ошибка при получении баланса аккаунта' },
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
