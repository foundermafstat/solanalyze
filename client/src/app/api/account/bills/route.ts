import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Получаем параметры запроса
    const searchParams = request.nextUrl.searchParams;
    const instType = searchParams.get('instType');
    const ccy = searchParams.get('ccy');
    const type = searchParams.get('type');
    const limit = searchParams.get('limit');

    // Формируем URL для запроса к серверу
    const serverUrl = new URL('http://localhost:3001/api/account/bills');
    
    // Добавляем параметры запроса
    if (instType) serverUrl.searchParams.append('instType', instType);
    if (ccy) serverUrl.searchParams.append('ccy', ccy);
    if (type) serverUrl.searchParams.append('type', type);
    if (limit) serverUrl.searchParams.append('limit', limit);

    // Отправляем запрос к локальному серверу
    const response = await fetch(serverUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Проверяем тип контента ответа
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Server returned non-JSON:', textResponse.substring(0, 200));
      return NextResponse.json(
        { message: 'Server returned incorrect data format' },
        { status: 500 }
      );
    }
    
    // Получаем ответ JSON
    const data = await response.json();

    // Проверяем на пустые данные
    if (data && Object.keys(data).length === 0) {
      console.log('Empty response from server');
      return NextResponse.json({
        data: [],
        message: 'No available data for the specified parameters'
      });
    }

    // Если ответ не успешный, возвращаем ошибку
    if (!response.ok) {
      console.error('Error getting account bills:', data);
      return NextResponse.json(
        { message: data.message || 'Error getting account bills' },
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
