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
      console.error('Ошибка при получении статуса системы:', data);
      return NextResponse.json(
        { message: data.message || 'Ошибка при получении статуса системы' },
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
