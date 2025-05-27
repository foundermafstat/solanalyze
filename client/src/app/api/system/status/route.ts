import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Формируем URL для запроса к серверу
    const serverUrl = 'http://localhost:3001/api/status';

    // Отправляем запрос к локальному серверу
    const response = await fetch(serverUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Получаем ответ
    const data = await response.json();

    // Если ответ не успешный, возвращаем ошибку
    if (!response.ok) {
      console.error('Error getting system status:', data);
      return NextResponse.json(
        { message: data.message || 'Error getting system status' },
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
